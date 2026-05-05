import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type SubscriptionModelProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Omit<Subscription, "id" | "icon">) => void;
  subscription?: Subscription | null;
};

const billingOptions = ["Monthly", "Yearly"];
const statusOptions = ["active", "paused", "cancelled"];

const initialValues = {
  name: "",
  plan: "",
  category: "",
  paymentMethod: "",
  status: "active",
  price: "",
  currency: "USD",
  billing: "Monthly",
  renewalDate: dayjs().add(1, "month").format("YYYY-MM-DD"),
};

export default function SubscriptionModel({
  visible,
  onClose,
  onSubmit,
  subscription,
}: SubscriptionModelProps) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    setValues(
      subscription
        ? {
            name: subscription.name,
            plan: subscription.plan ?? "",
            category: subscription.category ?? "",
            paymentMethod: subscription.paymentMethod ?? "",
            status: subscription.status ?? "active",
            price: String(subscription.price),
            currency: subscription.currency ?? "USD",
            billing: subscription.billing,
            renewalDate: subscription.renewalDate
              ? dayjs(subscription.renewalDate).format("YYYY-MM-DD")
              : initialValues.renewalDate,
          }
        : initialValues,
    );
    setError(null);
  }, [subscription, visible]);

  const setField = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    const price = Number(values.price);

    if (!values.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price");
      return;
    }

    onSubmit({
      name: values.name.trim(),
      plan: values.plan.trim(),
      category: values.category.trim(),
      paymentMethod: values.paymentMethod.trim(),
      status: values.status,
      price,
      currency: values.currency.trim() || "USD",
      billing: values.billing,
      renewalDate: dayjs(values.renewalDate).isValid()
        ? dayjs(values.renewalDate).toISOString()
        : undefined,
      startDate: subscription?.startDate ?? dayjs().toISOString(),
      color: subscription?.color ?? "#fff8e7",
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="modal-overlay">
        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">
              {subscription ? "Edit subscription" : "New subscription"}
            </Text>
            <Pressable className="modal-close" onPress={onClose}>
              <Text className="modal-close-text">x</Text>
            </Pressable>
          </View>

          <ScrollView
            className="px-5"
            contentContainerClassName="gap-4 py-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {error ? <Text className="auth-error">{error}</Text> : null}

            <View className="auth-field">
              <Text className="auth-label">Name</Text>
              <TextInput
                className="auth-input"
                value={values.name}
                onChangeText={(value) => setField("name", value)}
                placeholder="Netflix, Figma, Notion"
                placeholderTextColor="rgba(8, 17, 38, 0.45)"
              />
            </View>

            <View className="picker-row">
              <View className="flex-1">
                <Text className="auth-label mb-2">Price</Text>
                <TextInput
                  className="auth-input"
                  value={values.price}
                  onChangeText={(value) => setField("price", value)}
                  placeholder="12.99"
                  keyboardType="decimal-pad"
                  placeholderTextColor="rgba(8, 17, 38, 0.45)"
                />
              </View>
              <View className="w-24">
                <Text className="auth-label mb-2">Currency</Text>
                <TextInput
                  className="auth-input"
                  value={values.currency}
                  onChangeText={(value) => setField("currency", value.toUpperCase())}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View className="auth-field">
              <Text className="auth-label">Billing</Text>
              <View className="picker-row">
                {billingOptions.map((option) => (
                  <Pressable
                    key={option}
                    className={`picker-option ${values.billing === option ? "picker-option-active" : ""}`}
                    onPress={() => setField("billing", option)}
                  >
                    <Text
                      className={`picker-option-text ${values.billing === option ? "picker-option-text-active" : ""}`}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="auth-field">
              <Text className="auth-label">Status</Text>
              <View className="category-scroll">
                {statusOptions.map((option) => (
                  <Pressable
                    key={option}
                    className={`category-chip ${values.status === option ? "category-chip-active" : ""}`}
                    onPress={() => setField("status", option)}
                  >
                    <Text
                      className={`category-chip-text ${values.status === option ? "category-chip-text-active" : ""}`}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {[
              ["plan", "Plan", "Pro, Premium, Team"],
              ["category", "Category", "Design, AI Tools, Streaming"],
              ["paymentMethod", "Payment method", "Visa ending in 1234"],
              ["renewalDate", "Renewal date", "YYYY-MM-DD"],
            ].map(([key, label, placeholder]) => (
              <View className="auth-field" key={key}>
                <Text className="auth-label">{label}</Text>
                <TextInput
                  className="auth-input"
                  value={values[key as keyof typeof values]}
                  onChangeText={(value) => setField(key as keyof typeof values, value)}
                  placeholder={placeholder}
                  placeholderTextColor="rgba(8, 17, 38, 0.45)"
                />
              </View>
            ))}

            <Pressable className="auth-button" onPress={handleSubmit}>
              <Text className="auth-button-text">
                {subscription ? "Save changes" : "Add subscription"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
