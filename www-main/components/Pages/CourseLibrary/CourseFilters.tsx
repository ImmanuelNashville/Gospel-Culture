import React, { Dispatch, SetStateAction } from 'react';
import { CategoryValue, SortValue } from '../../../pages/courses';
import Select, { SelectOption } from '../../Select';
import TextInput from '../../TextInput';
import { CourseCategory } from './CategoryTile';

interface CourseFiltersProps {
  selectedCategoryId: string;
  setSelectedCategory: Dispatch<SetStateAction<CategoryValue>>;
  selectedSortId: string;
  setSelectedSort: Dispatch<SetStateAction<SortValue>>;
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  categories: CourseCategory[];
  sectionTitle?: string;
  sectionSubtitle?: string;
}

const CourseFilters = React.forwardRef<HTMLInputElement, CourseFiltersProps>(function CourseFilters(
  {
    selectedCategoryId,
    setSelectedCategory,
    selectedSortId,
    setSelectedSort,
    searchValue,
    setSearchValue,
    categories,
    sectionTitle = 'Browse Courses',
    sectionSubtitle,
  },
  ref
) {
  const categoryOptions: SelectOption[] = [{ id: 'All', name: 'All' }, ...categories];
  const selectedCategory = categoryOptions.find((option) => option.id === selectedCategoryId) ?? categoryOptions[0];

  const sortingOptions: SelectOption[] = [
    { id: 'newest', name: 'Newest' },
    { id: 'nameAscending', name: 'Name A-Z' },
    { id: 'nameDescending', name: 'Name Z-A' },
  ];
  const selectedSort = sortingOptions.find((option) => option.id === selectedSortId) ?? sortingOptions[0];

  return (
    <section className="mb-8">
      <div className={sectionTitle || sectionSubtitle ? 'mb-4' : ''}>
        {sectionTitle ? (
          <h2 className="text-headline6 font-bold text-gray-800 dark:text-gray-300">{sectionTitle}</h2>
        ) : null}
        {sectionSubtitle ? <p className="font-bodycopy text-gray-500 dark:text-gray-400">{sectionSubtitle}</p> : null}
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        <div className="w-full">
          <Select
            label="Categories"
            options={categoryOptions}
            selected={selectedCategory}
            setSelected={(option) => setSelectedCategory(option.id as CategoryValue)}
          />
        </div>
        <div className="w-full">
          <Select
            label="Sort by"
            options={sortingOptions}
            selected={selectedSort}
            setSelected={(option) => setSelectedSort(option.id as SortValue)}
          />
        </div>
        <div className="w-full col-span-2">
          <TextInput
            ref={ref}
            label="Search"
            id="search-courses"
            placeholder="Search by location, title, or creator"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
});

export default CourseFilters;
