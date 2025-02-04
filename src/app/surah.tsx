import React, { useState, useContext, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  PanResponder,
  Animated,
  Dimensions,
} from "react-native";
import { ScreenDimensionsContext } from "../contexts/ScreenDimensionsProvider";
import { Image, ImageContentFit } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { rowDirection } from "../helpers/flexDirection";
import * as FileSystem from "expo-file-system";
import Alert from "./../components/ui/Alert";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";

export default function Surah() {
  const { screenWidth, screenHeight } = useContext(ScreenDimensionsContext);
  const [contentFit, setContentFit] = useState("fill");
  const { pageNumber, surahSlug } = useLocalSearchParams();
  const [currentPage, setCurrentPage] = useState(
    parseInt(pageNumber as string)
  );
  const { t } = useTranslation();
  const [imageUri, setImageUri] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const leftArrowAnim = useRef(new Animated.Value(0)).current;
  const rightArrowAnim = useRef(new Animated.Value(0)).current;
  const fitScreenAnim = useRef(new Animated.Value(0.8)).current;
  const [currentZoom, setCurrentZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1.5);
  const surahPageNumber = parseInt(pageNumber as string);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const hasSeenArrows = await AsyncStorage.getItem("hasSeenArrows");
        if (!hasSeenArrows) {
          setShowArrows(true);
          setCurrentPage(surahPageNumber);
          await AsyncStorage.setItem("hasSeenArrows", "true");
          animateArrows();
          setTimeout(() => fadeOutArrows(), 2500);
        } else {
          const getStoredPageNumber = await AsyncStorage.getItem(
            `surah-${surahSlug}`
          );
          if (
            getStoredPageNumber &&
            parseInt(getStoredPageNumber) >= currentPage
          ) {
            setCurrentPage(parseInt(getStoredPageNumber));
          } else {
            setCurrentPage(surahPageNumber);
          }
        }
      } catch (error) {
        console.error("Error retrieving stored page number:", error);
        setCurrentPage(surahPageNumber);
      } finally {
        setLoadingPage(false);
      }
    };
    checkFirstTime();
  }, [surahSlug]);

  useEffect(() => {
    // Listen to orientation changes
    const updateContentFit = () => {
      const { width, height } = Dimensions.get("window");
      setContentFit(width > height ? "contain" : "fill");
      setMaxZoom(width > height ? 3 : 1.5);
    };

    const subscription = Dimensions.addEventListener(
      "change",
      updateContentFit
    );

    updateContentFit();

    return () => {
      subscription.remove();
    };
  }, []);

  // Fade-out animation for arrows
  const fadeOutArrows = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500, // 500ms fade-out
      useNativeDriver: true,
    }).start(() => setShowArrows(false)); // Hide completely after animation
  };

  const saveCurrentPageToStorage = async (currentPage: number) => {
    try {
      await AsyncStorage.setItem(`surah-${surahSlug}`, currentPage.toString());
    } catch (error) {
      console.error("Error saving current page:", error);
    }
  };

  // Navigate to the next page
  const goToNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage((prevPage: number) => {
        const nextPage = prevPage + 1;
        saveCurrentPageToStorage(nextPage);
        return nextPage;
      });
    }
  };

  // Navigate to the previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage: number) => {
        const prevPageNumber = prevPage - 1;
        saveCurrentPageToStorage(prevPageNumber);
        return prevPageNumber;
      });
    }
  };

  // Detect swipe gestures using PanResponder
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;

        if (dx > 50) {
          // Swipe right (go to the next page)
          goToNextPage();
        } else if (dx < -50) {
          // Swipe left (go to the previous page)
          goToPreviousPage();
        }
      },
    })
  ).current;

  const animateArrows = () => {
    // Left arrow: Moves from center to the left
    Animated.loop(
      Animated.sequence([
        Animated.timing(leftArrowAnim, {
          toValue: -30, // Move left by 30 pixels
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(leftArrowAnim, {
          toValue: 0, // Return to original position
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Right arrow: Moves from center to the right
    Animated.loop(
      Animated.sequence([
        Animated.timing(rightArrowAnim, {
          toValue: 30, // Move right by 30 pixels
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(rightArrowAnim, {
          toValue: 0, // Return to original position
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fitScreenAnim, {
          toValue: 1, // Scale to 1
          duration: 500, // 500ms for scaling up
          useNativeDriver: true, // Use native driver for better performance
        }),
        Animated.timing(fitScreenAnim, {
          toValue: 0.8, // Scale back to 0.8
          duration: 500, // 500ms for scaling down
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleZoomChange = () => {
    const zoomValue = zoomableViewRef.current.zoomAnim;
    if (zoomValue <= 1) {
      setCurrentZoom(1);
    } else {
      setCurrentZoom(zoomValue);
    }
    startAnimation();
  };

  const zoomableViewRef = useRef(null);

  const handleResetZoom = () => {
    zoomableViewRef?.current.zoomTo(1);
    setCurrentZoom(1);
  };

  const getImagePath = (pageNumber: number) => {
    return `${FileSystem.documentDirectory}quran-pages/${pageNumber}.jpg`;
  };

  const downloadImageIfNeeded = async (pageNumber: number) => {
    const localImagePath = getImagePath(pageNumber);
    const imageExists = await FileSystem.getInfoAsync(localImagePath);
    setIsOffline(false);

    if (imageExists.exists) {
      setImageUri(localImagePath);
    } else {
      const remoteImageUrl = `https://storage.googleapis.com/way2quran_storage/quran-pages/${pageNumber}.jpg`;

      try {
        await FileSystem.makeDirectoryAsync(
          `${FileSystem.documentDirectory}quran-pages/`,
          {
            intermediates: true,
          }
        );
        await FileSystem.downloadAsync(remoteImageUrl, localImagePath);
        setImageUri(localImagePath);
        setIsOffline(false);
      } catch (error) {
        setIsOffline(true);
      }
    }
  };

  useEffect(() => {
    downloadImageIfNeeded(currentPage);
  }, [currentPage]);

  return (
    <ReactNativeZoomableView
      ref={zoomableViewRef}
      maxZoom={maxZoom}
      minZoom={1}
      zoomStep={0.5}
      initialZoom={1}
      bindToBorders={true}
      shouldRasterizeIOS={true}
      style={{
        flex: 1,
      }}
      onZoomAfter={handleZoomChange}
      onZoomEnd={handleZoomChange}
    >
      <View
        style={[styles.container, { width: screenWidth, height: screenHeight }]}
        {...(currentZoom <= 1 ? panResponder.panHandlers : undefined)}
      >
        {showArrows && (
          <View className="absolute z-10 flex-row justify-between w-full px-3 top-1/2">
            {/* Left Arrow */}
            <Animated.View
              style={[
                styles.arrow,
                { transform: [{ translateX: leftArrowAnim }] },
              ]}
            >
              <AntDesign name="arrowleft" size={24} color="white" />
            </Animated.View>

            {/* Right Arrow */}
            <Animated.View
              style={[
                styles.arrow,
                { transform: [{ translateX: rightArrowAnim }] },
              ]}
            >
              <AntDesign name="arrowright" size={30} color="white" />
            </Animated.View>
          </View>
        )}

        {/* Add Reset Zoom Button */}
        {currentZoom !== 1 && (
          <Animated.View
            style={[
              styles.resetZoomButton,
              { transform: [{ scale: fitScreenAnim }] },
            ]}
            onTouchEnd={handleResetZoom}
          >
            <MaterialCommunityIcons
              name="fit-to-screen"
              size={26}
              color="white"
            />
          </Animated.View>
        )}

        {isOffline && (
          <Alert
            type="warning"
            message={t("offline")}
            onClose={() => setIsOffline(false)}
          />
        )}
        {!loadingPage && (
          <Image
            source={imageUri}
            className="w-full h-full"
            contentFit={contentFit as ImageContentFit}
            transition={300}
          />
        )}
      </View>
    </ReactNativeZoomableView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#FEF9DE",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowContainer: {
    position: "absolute",
    top: "50%",
    width: "100%",
    flexDirection: rowDirection(),
    justifyContent: "space-between",
    paddingHorizontal: 30,
    zIndex: 10,
  },
  arrow: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
  },
  arrowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  resetZoomButton: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    zIndex: 10,
  },
});
