import SubscriptionCard from "@/components/SubscriptionCard";
import SubscriptionModel from "@/components/SubscriptionModel";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { formatCurrency } from "@/lib/utils";
import { clsx } from "clsx";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const filters = ["all", "active", "paused", "cancelled"];

export default function Subscriptions() {
  const {
    subscriptions,
    monthlyTotal,
    addSubscription,
    updateSubscription,
    cancelSubscription,
  } = useSubscriptions();
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredSubscriptions = useMemo(
    () =>
      activeFilter === "all"
        ? subscriptions
        : subscriptions.filter((item) => item.status === activeFilter),
    [activeFilter, subscriptions],
  );

  const handleSubmit = (input: Omit<Subscription, "id" | "icon">) => {
    if (editingSubscription) {
      updateSubscription(editingSubscription.id, input);
      return;
    }

    addSubscription(input);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <SubscriptionModel
        visible={modalVisible}
        subscription={editingSubscription}
        onClose={() => {
          setModalVisible(false);
          setEditingSubscription(null);
        }}
        onSubmit={handleSubmit}
      />

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
        ListHeaderComponent={
          <View className="mb-5 gap-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-3xl font-sans-bold text-primary">
                  Subscriptions
                </Text>
                <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
                  {subscriptions.length} tracked • {formatCurrency(monthlyTotal)} monthly
                </Text>
              </View>
              <Pressable
                className="rounded-full bg-accent px-5 py-3"
                onPress={() => {
                  setEditingSubscription(null);
                  setModalVisible(true);
                }}
              >
                <Text className="font-sans-bold text-primary">Add</Text>
              </Pressable>
            </View>

            <View className="category-scroll">
              {filters.map((filter) => (
                <Pressable
                  key={filter}
                  className={clsx(
                    "category-chip",
                    activeFilter === filter && "category-chip-active",
                  )}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    className={clsx(
                      "category-chip-text",
                      activeFilter === filter && "category-chip-text-active",
                    )}
                  >
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onCancelPress={() => cancelSubscription(item.id)}
            onPress={() => {
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              );
            }}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions in this view.</Text>
        }
        ListFooterComponent={
          filteredSubscriptions.length ? (
            <Pressable
              className="mt-5 items-center rounded-2xl border border-border bg-card py-4"
              onPress={() => {
                const selected = subscriptions.find(
                  (item) => item.id === expandedSubscriptionId,
                );
                if (selected) {
                  setEditingSubscription(selected);
                  setModalVisible(true);
                }
              }}
              disabled={!expandedSubscriptionId}
              style={{ opacity: expandedSubscriptionId ? 1 : 0.45 }}
            >
              <Text className="font-sans-bold text-primary">
                Edit selected subscription
              </Text>
            </Pressable>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
