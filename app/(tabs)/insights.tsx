import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const toMonthlyPrice = (subscription: Subscription) =>
  subscription.billing.toLowerCase() === "yearly"
    ? subscription.price / 12
    : subscription.price;

export default function Insights() {
  const { subscriptions, activeSubscriptions, monthlyTotal } = useSubscriptions();

  const yearlyTotal = monthlyTotal * 12;
  const nextRenewal = useMemo(
    () =>
      activeSubscriptions
        .filter((item) => item.renewalDate)
        .sort((a, b) => dayjs(a.renewalDate).valueOf() - dayjs(b.renewalDate).valueOf())[0],
    [activeSubscriptions],
  );

  const categoryRows = useMemo(() => {
    const totals = activeSubscriptions.reduce<Record<string, number>>((acc, item) => {
      const key = item.category || "Uncategorized";
      acc[key] = (acc[key] ?? 0) + toMonthlyPrice(item);
      return acc;
    }, {});

    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeSubscriptions]);

  const statusRows = useMemo(() => {
    const totals = subscriptions.reduce<Record<string, number>>((acc, item) => {
      const key = item.status || "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(totals).map(([status, count]) => ({ status, count }));
  }, [subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        data={categoryRows}
        keyExtractor={(item) => item.category}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
        ListHeaderComponent={
          <View className="gap-5">
            <View>
              <Text className="text-3xl font-sans-bold text-primary">Insights</Text>
              <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
                Live overview from your tracked subscriptions.
              </Text>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Forecast</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(yearlyTotal)}
                </Text>
                <Text className="home-balance-date">/yr</Text>
              </View>
            </View>

            <View className="picker-row">
              <View className="flex-1 rounded-2xl border border-border bg-card p-4">
                <Text className="text-sm font-sans-semibold text-muted-foreground">
                  Active
                </Text>
                <Text className="mt-2 text-2xl font-sans-bold text-primary">
                  {activeSubscriptions.length}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl border border-border bg-card p-4">
                <Text className="text-sm font-sans-semibold text-muted-foreground">
                  Monthly
                </Text>
                <Text className="mt-2 text-2xl font-sans-bold text-primary">
                  {formatCurrency(monthlyTotal)}
                </Text>
              </View>
            </View>

            <View className="rounded-[28px] border border-border bg-card p-5">
              <Text className="text-sm font-sans-semibold uppercase text-muted-foreground">
                Next Renewal
              </Text>
              <Text className="mt-2 text-xl font-sans-bold text-primary">
                {nextRenewal?.name ?? "Nothing upcoming"}
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                {nextRenewal?.renewalDate
                  ? formatSubscriptionDateTime(nextRenewal.renewalDate)
                  : "Add a renewal date to see alerts."}
              </Text>
            </View>

            <View>
              <Text className="list-title">Spend by category</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mt-4 rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-center justify-between gap-4">
              <Text className="flex-1 text-base font-sans-bold text-primary">
                {item.category}
              </Text>
              <Text className="text-base font-sans-bold text-primary">
                {formatCurrency(item.amount)}
              </Text>
            </View>
            <View className="mt-3 h-2 rounded-full bg-muted">
              <View
                className="h-2 rounded-full bg-accent"
                style={{
                  width: `${Math.min((item.amount / Math.max(monthlyTotal, 1)) * 100, 100)}%`,
                }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="home-empty-state">
            Add subscriptions to unlock spending insights.
          </Text>
        }
        ListFooterComponent={
          <View className="mt-5 rounded-[28px] border border-border bg-card p-5">
            <Text className="text-sm font-sans-semibold uppercase text-muted-foreground">
              Status mix
            </Text>
            <View className="mt-3 gap-2">
              {statusRows.map((item) => (
                <View
                  key={item.status}
                  className="flex-row items-center justify-between"
                >
                  <Text className="font-sans-medium text-muted-foreground">
                    {item.status}
                  </Text>
                  <Text className="font-sans-bold text-primary">{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
