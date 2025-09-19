interface GlobalSearch {
  openSearch: () => void;
}

export const useGlobalSearch = () => {
  const globalSearch = inject<GlobalSearch>("globalSearch");

  const openSearch = (): void => {
    globalSearch?.openSearch();
  };

  return {
    openSearch,
  };
};
