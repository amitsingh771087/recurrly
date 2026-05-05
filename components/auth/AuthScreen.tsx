import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { styled } from 'nativewind'

const SafeAreaView = styled(RNSafeAreaView)

type AuthScreenProps = {
  title: string
  subtitle: string
  footer?: React.ReactNode
  children: React.ReactNode
  showCaptcha?: boolean
}

export default function AuthScreen({
  title,
  subtitle,
  footer,
  children,
  showCaptcha = false,
}: AuthScreenProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-bg-orb auth-bg-orb-primary" pointerEvents="none" />
          <View className="auth-bg-orb auth-bg-orb-secondary" pointerEvents="none" />

          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurrly</Text>
                <Text className="auth-wordmark-sub">SMART BILLING</Text>
              </View>
            </View>
            <Text className="auth-title">{title}</Text>
            <Text className="auth-subtitle">{subtitle}</Text>
            <View className="auth-trust-row">
              <View className="auth-trust-chip">
                <Text className="auth-trust-chip-text">Secure by Clerk</Text>
              </View>
              <View className="auth-trust-chip">
                <Text className="auth-trust-chip-text">Email verified</Text>
              </View>
              <View className="auth-trust-chip">
                <Text className="auth-trust-chip-text">Fast setup</Text>
              </View>
            </View>
          </View>

          <View className="auth-card">{children}</View>

          {footer ? <View className="auth-footer">{footer}</View> : null}

          {showCaptcha ? <View nativeID="clerk-captcha" /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
