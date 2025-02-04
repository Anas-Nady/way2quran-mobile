import React, { useState, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { searchItems } from "../services/api";
import SearchInput from "../components/Search/SearchInput";
import SearchResult from "../components/Search/SearchResult";
import { debounce } from "lodash";
import { useTranslate } from "../helpers/i18nHelper";
import GoBackButton from "../components/ui/GoBackButton";
import { IReciter, IReciterRecitation, ISurah } from "../types/types";

interface ISearchResult {
  reciters: IReciter[];
  recitations: IReciterRecitation[];
  surahs: ISurah[];
}

export default function Search() {
  const translate = useTranslate("SearchScreen");
  const [results, setResults] = useState<ISearchResult>({
    reciters: [],
    recitations: [],
    surahs: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = async (searchValue: string) => {
    if (!searchValue || searchValue.trim() === "") {
      setResults({ reciters: [], recitations: [], surahs: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchItems({ query: searchValue });

      if (response.ok) {
        const data = await response.json();
        setResults({
          reciters: data.reciters || [],
          recitations: data.recitations || [],
          surahs: data.surahs || [],
        });
      } else {
        setError(translate("fetchError"));
      }
    } catch (err) {
      setError(err?.message || translate("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchResults = useCallback(
    debounce((searchValue: string) => fetchResults(searchValue), 300),
    []
  );

  const handleTextDebounce = (text: string) => {
    debouncedFetchResults(text);
  };

  return (
    <ScrollView className="flex-1 w-full h-full bg-gray-800">
      <View>
        <GoBackButton />
        <SearchInput handleTextDebounce={handleTextDebounce} />
        <SearchResult results={results} loading={loading} error={error} />
      </View>
    </ScrollView>
  );
}
