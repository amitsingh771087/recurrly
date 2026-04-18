import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1  bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 p-4 rounded-2xl bg-primary text-white"
      >
        {" "}
        Go to Onboarding
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 p-4 rounded-2xl bg-primary text-white"
      >
        {" "}
        Go to SingIn
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 p-4 rounded-2xl bg-primary text-white"
      >
        {" "}
        Go to SignUp
      </Link>
      <Link
        href="/subscriptions/spotify"
        className="mt-4 p-4 rounded-2xl bg-primary text-white"
      >
        {" "}
        Go Spotify
      </Link>
      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
        className="mt-4 p-4 rounded-2xl bg-primary text-white"
      >
        {" "}
        Go to SignUp
      </Link>
    </SafeAreaView>
  );
}
