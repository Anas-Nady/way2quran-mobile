import React from "react";
import { View, Text, ScrollView } from "react-native";
import ContactUsForm from "../components/ContactUsForm";
import HeadingScreen from "../components/HeadingScreen";
import GoBackButton from "../components/ui/GoBackButton";
import { useTranslate } from "../helpers/i18nHelper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function ContactUs() {
  const translate = useTranslate("ContactUsScreen");

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      resetScrollToCoords={{ x: 0, y: 0 }}
      contentContainerStyle={{ flex: 1 }}
      scrollEnabled={true}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="w-full bg-slate-800"
        style={{ flex: 1 }}
      >
        <View>
          <GoBackButton />
          <HeadingScreen headingTxt={translate("contactTitle")} />
        </View>
        <View className="w-full mx-auto">
          <Text className="px-2 mb-1 text-base text-center text-gray-400">
            {translate("contactDescription")}
          </Text>
          <ContactUsForm />
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}
