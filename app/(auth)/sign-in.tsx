import AuthScreen from '@/components/auth/AuthScreen'
import {
  getCodeError,
  getEmailError,
  getPostAuthUrl,
  getSignInPasswordError,
  navigateToUrl,
  normalizeEmail,
} from '@/lib/auth'
import { useAuth, useSignIn } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn()
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
    signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor'

  const emailError = getEmailError(emailAddress)
  const passwordError = getSignInPasswordError(password)
  const codeError = getCodeError(code)
  const canSubmit = !emailError && !passwordError
  const isSubmitting = fetchStatus === 'fetching'
  const hasServerCodeError = errors.fields.code?.message
  const serverEmailError = errors.fields.identifier?.message ?? null
  const serverPasswordError = errors.fields.password?.message ?? null

  const requestEmailVerificationCode = useCallback(async () => {
    const emailCodeFactor = signIn.supportedSecondFactors.find(
      (factor) => factor.strategy === 'email_code',
    )

    if (!emailCodeFactor) {
      setFlowError('Email verification is not available for this account. Try another sign-in method.')
      return false
    }

    const { error } = await signIn.mfa.sendEmailCode()

    if (error) {
      setFlowError(error.message ?? 'We could not send the verification code.')
      return false
    }

    setVerificationCodeRequested(true)
    return true
  }, [signIn])

  useEffect(() => {
    if (!verificationRequired) {
      setVerificationCodeRequested(false)
      return
    }

    if (verificationCodeRequested) {
      return
    }

    void requestEmailVerificationCode()
  }, [requestEmailVerificationCode, verificationCodeRequested, verificationRequired])

  const finalizeSignIn = async () => {
    await signIn.finalize({
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

    const { error } = await signIn.password({
      emailAddress: normalizeEmail(emailAddress),
      password,
    })

    if (error) {
      return
    }

    if (signIn.status === 'complete') {
      await finalizeSignIn()
      return
    }

    const requiresVerification =
      signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor'

    if (requiresVerification) {
      const codeSent = await requestEmailVerificationCode()
      if (codeSent) {
        setCode('')
      }
      setCodeTouched(true)
      return
    }

    setFlowError('We need one more step to sign you in, but this app only supports email verification right now.')
  }

  const handleVerify = async () => {
    setCodeTouched(true)
    setFlowError(null)

    if (codeError || isSubmitting) {
      return
    }

    const { error } = await signIn.mfa.verifyEmailCode({
      code: code.trim(),
    })

    if (error) {
      // keep the UI on the verification screen and show the Clerk error
      setFlowError(error.message ?? 'Verification failed.')
      return
    }

    if (signIn.status === 'complete') {
      await finalizeSignIn()
      return
    }

    setFlowError('That code was accepted, but sign-in still needs another step.')
  }

  const handleResendCode = async () => {
    if (isSubmitting) {
      return
    }

    setFlowError(null)
    await requestEmailVerificationCode()
  }

  if (isSignedIn || signIn.status === 'complete') {
    return null
  }

  if (verificationRequired) {
    return (
      <AuthScreen
        title="Verify your identity"
        subtitle="We sent a one-time code to your email address. Enter it here to finish signing in."
        footer={
          <View className="auth-link-row">
            <Text className="auth-link-copy">Need a different account?</Text>
            <Pressable
              onPress={async () => {
                await signIn.reset()
                setCode('')
                setCodeTouched(false)
                setVerificationCodeRequested(false)
                setFlowError(null)
              }}
            >
              <Text className="auth-link">Start over</Text>
            </Pressable>
          </View>
        }
      >
        <View className="auth-form">
          {flowError ? <Text className="auth-error">{flowError}</Text> : null}
          <View className="auth-field">
            <Text className="auth-label">Verification Code</Text>
            <TextInput
              className={`auth-input ${codeTouched && codeError ? 'auth-input-error' : ''} ${hasServerCodeError ? 'auth-input-error' : ''}`}
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
            {hasServerCodeError ? <Text className="auth-error">{hasServerCodeError}</Text> : null}
          </View>

          <Pressable
            className={`auth-button ${codeError ? 'auth-button-disabled' : ''}`}
            onPress={handleVerify}
            disabled={isSubmitting || !!codeError}
            style={({ pressed }) => [{ opacity: pressed && !isSubmitting ? 0.88 : 1 }]}
          >
            <Text className="auth-button-text">{isSubmitting ? 'Verifying...' : 'Verify'}</Text>
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
              await signIn.reset()
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
      title="Welcome back"
      subtitle="Sign in to continue managing your subscriptions."
      footer={
        <View className="auth-link-row">
          <Text className="auth-link-copy">New to Recurrly?</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text className="auth-link">Create account</Text>
            </Pressable>
          </Link>
        </View>
      }
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
            placeholder="Enter your password"
            placeholderTextColor="rgba(8, 17, 38, 0.45)"
            secureTextEntry
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
          />
          {passwordTouched && passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
          {serverPasswordError ? <Text className="auth-error">{serverPasswordError}</Text> : null}
        </View>

        <Pressable
          className={`auth-button ${!canSubmit || isSubmitting ? 'auth-button-disabled' : ''}`}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          style={({ pressed }) => [{ opacity: pressed && !isSubmitting ? 0.88 : 1 }]}
        >
          <Text className="auth-button-text">{isSubmitting ? 'Signing in...' : 'Sign in'}</Text>
        </Pressable>
      </View>
    </AuthScreen>
  )
}
