import AuthScreen from '@/components/auth/AuthScreen'
import {
  getCodeError,
  getEmailError,
  getPasswordError,
  getPostAuthUrl,
  navigateToUrl,
  normalizeEmail,
} from '@/lib/auth'
import { useAuth, useSignUp } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [codeTouched, setCodeTouched] = useState(false)
  const [verificationCodeRequested, setVerificationCodeRequested] = useState(false)
  const [flowError, setFlowError] = useState<string | null>(null)

  const verificationRequired =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0

  const emailError = getEmailError(emailAddress)
  const passwordError = getPasswordError(password)
  const codeError = getCodeError(code)
  const canSubmit = !emailError && !passwordError
  const isSubmitting = fetchStatus === 'fetching'
  const serverEmailError = errors.fields.emailAddress?.message ?? null
  const serverPasswordError = errors.fields.password?.message ?? null
  const serverCodeError = errors.fields.code?.message ?? null

  useEffect(() => {
    if (!verificationRequired || verificationCodeRequested) {
      return
    }

    const sendVerificationCode = async () => {
      const { error } = await signUp.verifications.sendEmailCode()

      if (error) {
        setFlowError(error.message ?? 'We could not send the verification code.')
        return
      }

      setVerificationCodeRequested(true)
    }

    void sendVerificationCode()
  }, [signUp, verificationCodeRequested, verificationRequired])

  const finalizeSignUp = async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        const destination = getPostAuthUrl(session, decorateUrl)
        navigateToUrl(router, destination)
      },
    })
  }

  const handleSubmit = async () => {
    setEmailTouched(true)
    setPasswordTouched(true)
    setFlowError(null)

    if (!canSubmit || isSubmitting) {
      return
    }

    const { error } = await signUp.password({
      emailAddress: normalizeEmail(emailAddress),
      password,
    })

    if (error) {
      setFlowError(error.message ?? 'Unable to create account right now.')
      return
    }

    if (signUp.status === 'complete') {
      await finalizeSignUp()
      return
    }

    setVerificationCodeRequested(true)
    const { error: codeErrorResult } = await signUp.verifications.sendEmailCode()

    if (codeErrorResult) {
      setVerificationCodeRequested(false)
      setFlowError(codeErrorResult.message ?? 'We could not send the verification code.')
      return
    }

    setCode('')
    setCodeTouched(false)
  }

  const handleVerify = async () => {
    setCodeTouched(true)
    setFlowError(null)

    if (codeError || isSubmitting) {
      return
    }

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    })

    if (error) {
      setFlowError(error.message ?? 'Verification failed.')
      return
    }

    if (signUp.status === 'complete') {
      await finalizeSignUp()
      return
    }

    setFlowError('That code was accepted, but sign-up still needs another step.')
  }

  const handleResendCode = async () => {
    if (isSubmitting) {
      return
    }

    setFlowError(null)
    setVerificationCodeRequested(true)
    const { error } = await signUp.verifications.sendEmailCode()

    if (error) {
      setFlowError(error.message ?? 'Unable to resend the code.')
    }
  }

  if (isSignedIn || signUp.status === 'complete') {
    return null
  }

  if (verificationRequired || verificationCodeRequested) {
    return (
      <AuthScreen
        title="Verify your email"
        subtitle={`We sent a one-time code to ${normalizeEmail(emailAddress) || 'your inbox'}. Enter it to finish creating your account.`}
        footer={
          <View className="auth-link-row">
            <Text className="auth-link-copy">Already verified?</Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text className="auth-link">Go to sign in</Text>
              </Pressable>
            </Link>
          </View>
        }
        showCaptcha
      >
        <View className="auth-form">
          {flowError ? <Text className="auth-error">{flowError}</Text> : null}
          <View className="auth-field">
            <Text className="auth-label">Verification Code</Text>
            <TextInput
              className={`auth-input ${codeTouched && codeError ? 'auth-input-error' : ''} ${serverCodeError ? 'auth-input-error' : ''}`}
              value={code}
              placeholder="Enter 6-digit code"
              placeholderTextColor="rgba(8, 17, 38, 0.45)"
              onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
              onBlur={() => setCodeTouched(true)}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              maxLength={6}
            />
            {codeTouched && codeError ? <Text className="auth-error">{codeError}</Text> : null}
            {serverCodeError ? <Text className="auth-error">{serverCodeError}</Text> : null}
          </View>

          <Pressable
            className={`auth-button ${codeError ? 'auth-button-disabled' : ''}`}
            onPress={handleVerify}
            disabled={isSubmitting || !!codeError}
            style={({ pressed }) => [{ opacity: pressed && !isSubmitting ? 0.88 : 1 }]}
          >
            <Text className="auth-button-text">{isSubmitting ? 'Verifying...' : 'Verify email'}</Text>
          </Pressable>

          <Pressable
            className="auth-secondary-button"
            onPress={handleResendCode}
            disabled={isSubmitting}
            style={({ pressed }) => [{ opacity: pressed && !isSubmitting ? 0.88 : 1 }]}
          >
            <Text className="auth-secondary-button-text">Resend code</Text>
          </Pressable>

          <Pressable
            className="auth-secondary-button"
            onPress={async () => {
              await signUp.reset()
              setCode('')
              setCodeTouched(false)
              setVerificationCodeRequested(false)
              setFlowError(null)
            }}
            disabled={isSubmitting}
            style={({ pressed }) => [{ opacity: pressed && !isSubmitting ? 0.88 : 1 }]}
          >
            <Text className="auth-secondary-button-text">Start over</Text>
          </Pressable>
        </View>
      </AuthScreen>
    )
  }

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Start tracking your subscriptions and never miss a payment."
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="auth-link">Sign in</Text>
            </Pressable>
          </Link>
        </View>
      }
      showCaptcha
    >
      <View className="auth-form">
        {flowError ? <Text className="auth-error">{flowError}</Text> : null}
        <View className="auth-field">
          <Text className="auth-label">Email</Text>
          <TextInput
            className={`auth-input ${emailTouched && emailError ? 'auth-input-error' : ''} ${serverEmailError ? 'auth-input-error' : ''}`}
            autoCapitalize="none"
            autoCorrect={false}
            value={emailAddress}
            placeholder="Enter your email"
            placeholderTextColor="rgba(8, 17, 38, 0.45)"
            onChangeText={setEmailAddress}
            onBlur={() => setEmailTouched(true)}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          {emailTouched && emailError ? <Text className="auth-error">{emailError}</Text> : null}
          {serverEmailError ? <Text className="auth-error">{serverEmailError}</Text> : null}
        </View>

        <View className="auth-field">
          <Text className="auth-label">Password</Text>
          <TextInput
            className={`auth-input ${passwordTouched && passwordError ? 'auth-input-error' : ''} ${serverPasswordError ? 'auth-input-error' : ''}`}
            value={password}
            placeholder="Create a strong password"
            placeholderTextColor="rgba(8, 17, 38, 0.45)"
            secureTextEntry
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password-new"
            textContentType="newPassword"
          />
          {passwordTouched && passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
          {serverPasswordError ? <Text className="auth-error">{serverPasswordError}</Text> : null}
          {!passwordTouched && !serverPasswordError ? (
            <Text className="auth-helper">Use at least 8 characters.</Text>
          ) : null}
        </View>

        <Pressable
          className={`auth-button ${!canSubmit || isSubmitting ? 'auth-button-disabled' : ''}`}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          style={({ pressed }) => [{ opacity: pressed && !isSubmitting ? 0.88 : 1 }]}
        >
          <Text className="auth-button-text">{isSubmitting ? 'Creating account...' : 'Create account'}</Text>
        </Pressable>
      </View>
    </AuthScreen>
  )
}
