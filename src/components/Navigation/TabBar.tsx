import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslate } from "../../helpers/i18nHelper";
import { flexDirection } from "../../helpers/flexDirection";
import { Href, useRouter } from "expo-router";
import { ITabLink } from "../../types/types";

export default function TabBar({ closeMenu }) {
  const translate = useTranslate("TabBar");
  const router = useRouter();
  const tabsLinks: ITabLink[] = [
    { label: translate("home"), routeName: "/", icon: "home" },
    {
      label: translate("playlist"),
      routeName: "/playlist",
      icon: "playlist-add",
    },
    {
      label: translate("favorites"),
      routeName: "/favorites",
      icon: "favorite",
    },
    {
      label: translate("mushaf"),
      routeName: "/mushaf",
      icon: "menu-book",
    },
  ];
  const handleMenuPress = (routeName: Href<string>) => {
    closeMenu();
    router.push(routeName);
  };

  return (
    <View className="w-[97%] bg-gray-700 rounded-full mx-auto py-1 px-4">
      <View className={`${flexDirection()} items-center justify-between`}>
        {tabsLinks.map((tab, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleMenuPress(tab.routeName)}
          >
            <View className="flex-col items-center justify-center">
              <MaterialIcons name={tab.icon as any} size={24} color="#22c55e" />
              <Text className="font-semibold text-green-500 text-md">
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => router.push("prayer-times" as Href<string | object>)}
        >
          <View className="flex-col items-center justify-center">
            <Image
              source={require("../../assets/images/mosqueIcon.png")}
              width={24}
            />
            <Text className="font-semibold text-green-500 text-md">
              {translate("prayerTimes")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
