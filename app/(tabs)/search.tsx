import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  useEffect(() => {
    // mengurangi request ke api setiap kali mengetikan 1 huruf (Debounce)
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();

        if (movies?.length > 0 && movies?.[0]) {
          await updateSearchCount(searchQuery, movies[0]);
        }
      } else {
        reset();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full h-full z-0"
        resizeMode="cover"
      />
      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100, minHeight: "100%" }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center items-center mt-20">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>
            <View className="my-5">
              <SearchBar
                placeholder="Search movies....."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>

            {moviesLoading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="mt-10 self-center"
              />
            )}
            {moviesError && (
              <Text className="text-red-500 px-5 my-3">
                Error: {moviesError?.message}
              </Text>
            )}
            {!moviesLoading &&
              !moviesError &&
              searchQuery.trim() &&
              movies?.length > 0 && (
                <Text className="text-xl text-white font-bold">
                  Search result for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !moviesLoading && !moviesError ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim() ? "No movie found" : "Search for a movie"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default SearchPage;
