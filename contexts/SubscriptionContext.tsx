import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import dayjs from "dayjs";
import React, { createContext, useContext, useMemo, useState } from "react";

type SubscriptionInput = Omit<Subscription, "id" | "icon"> & {
  id?: string;
  icon?: Subscription["icon"];
};

type SubscriptionContextValue = {
  subscriptions: Subscription[];
  upcomingSubscriptions: UpcomingSubscription[];
  monthlyTotal: number;
  activeSubscriptions: Subscription[];
  addSubscription: (input: SubscriptionInput) => void;
  updateSubscription: (id: string, input: SubscriptionInput) => void;
  cancelSubscription: (id: string) => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

const toMonthlyPrice = (subscription: Subscription) =>
  subscription.billing.toLowerCase() === "yearly"
    ? subscription.price / 12
    : subscription.price;

const createId = (name: string) =>
  `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((item) => item.status !== "cancelled"),
    [subscriptions],
  );

  const upcomingSubscriptions = useMemo(
    () =>
      activeSubscriptions
        .filter((item) => item.renewalDate)
        .map((item) => ({
          id: item.id,
          icon: item.icon,
          name: item.name,
          price: item.price,
          currency: item.currency,
          daysLeft: Math.max(dayjs(item.renewalDate).diff(dayjs(), "day"), 0),
        }))
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 5),
    [activeSubscriptions],
  );

  const monthlyTotal = useMemo(
    () => activeSubscriptions.reduce((sum, item) => sum + toMonthlyPrice(item), 0),
    [activeSubscriptions],
  );

  const addSubscription = (input: SubscriptionInput) => {
    setSubscriptions((current) => [
      {
        ...input,
        id: input.id ?? createId(input.name),
        icon: input.icon ?? icons.wallet,
        status: input.status ?? "active",
        currency: input.currency ?? "USD",
      },
      ...current,
    ]);
  };

  const updateSubscription = (id: string, input: SubscriptionInput) => {
    setSubscriptions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...input,
              icon: input.icon ?? item.icon,
            }
          : item,
      ),
    );
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "cancelled" } : item,
      ),
    );
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        upcomingSubscriptions,
        monthlyTotal,
        activeSubscriptions,
        addSubscription,
        updateSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error("useSubscriptions must be used inside SubscriptionProvider");
  }

  return context;
};
