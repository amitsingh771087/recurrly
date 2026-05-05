import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import SubscriptionModel from "@/components/SubscriptionModel";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const {
    subscriptions,
    upcomingSubscriptions,
    monthlyTotal,
    addSubscription,
    cancelSubscription,
  } = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [subscriptionModelVisible, setSubscriptionModelVisible] =
    useState(false);

  const { user } = useUser();

  // Get user display name: firstName, fullName, or email
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  const nextRenewalDate = upcomingSubscriptions[0]?.id
    ? subscriptions.find((item) => item.id === upcomingSubscriptions[0].id)
        ?.renewalDate
    : undefined;

  return (
    <SafeAreaView className="flex-1  bg-background p-5">
      <SubscriptionModel
        visible={subscriptionModelVisible}
        onClose={() => setSubscriptionModelVisible(false)}
        onSubmit={addSubscription}
      />
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>
              <Pressable onPress={() => setSubscriptionModelVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Monthly Spend</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(monthlyTotal)}
                </Text>
                <Text className="home-balance-date">
                  {nextRenewalDate ? dayjs(nextRenewalDate).format("MM/DD") : "--"}
                </Text>
              </View>
            </View>
            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No Upcoming Subscription{" "}
                  </Text>
                }
              ></FlatList>
            </View>
            <ListHeading title="Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onCancelPress={() => cancelSubscription(item.id)}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No Subscription yet.</Text>
        }
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}
