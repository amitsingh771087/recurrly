import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between gap-4 border-b border-border py-3">
    <Text className="text-sm font-sans-medium text-muted-foreground">{label}</Text>
    <Text
      className="max-w-[60%] text-right text-sm font-sans-bold text-primary"
      numberOfLines={1}
      ellipsizeMode="middle"
    >
      {value}
    </Text>
  </View>
);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { subscriptions, activeSubscriptions, monthlyTotal } = useSubscriptions();
  const router = useRouter();

  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? "Not available";
  const joinedAt = user?.createdAt
    ? formatSubscriptionDateTime(user.createdAt.toISOString())
    : "Not available";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="gap-5 pb-30 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
          <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
            Manage your Recurrly account and app data.
          </Text>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <View className="flex-row items-center gap-4">
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} className="size-16 rounded-full" />
            ) : (
              <View className="size-16 items-center justify-center rounded-full bg-accent">
                <Text className="text-2xl font-sans-extrabold text-primary">
                  {(user?.firstName ?? "R").charAt(0)}
                </Text>
              </View>
            )}
            <View className="min-w-0 flex-1">
              <Text className="text-xl font-sans-bold text-primary" numberOfLines={1}>
                {user?.fullName ?? user?.firstName ?? "Recurrly User"}
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground" numberOfLines={1}>
                {primaryEmail}
              </Text>
            </View>
          </View>

          <View className="mt-5">
            <DetailRow label="User ID" value={user?.id ?? "Not available"} />
            <DetailRow label="Joined" value={joinedAt} />
            <DetailRow
              label="Email verified"
              value={user?.primaryEmailAddress?.verification?.status ?? "unknown"}
            />
          </View>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <Text className="text-sm font-sans-semibold uppercase text-muted-foreground">
            Subscription Summary
          </Text>
          <View className="mt-3 gap-2">
            <DetailRow label="Tracked" value={String(subscriptions.length)} />
            <DetailRow label="Active" value={String(activeSubscriptions.length)} />
            <DetailRow label="Monthly spend" value={formatCurrency(monthlyTotal)} />
          </View>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <Text className="text-sm font-sans-semibold uppercase text-muted-foreground">
            App
          </Text>
          <DetailRow label="Secure auth" value="Clerk" />
          <DetailRow label="Data mode" value="Local session" />
          <DetailRow label="Currency default" value="USD" />
        </View>

        <Pressable
          className="items-center rounded-2xl bg-primary py-4"
          onPress={handleSignOut}
          style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
        >
          <Text className="text-base font-sans-bold text-background">Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
