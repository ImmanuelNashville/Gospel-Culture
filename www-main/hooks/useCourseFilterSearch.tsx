import appConfig from 'appConfig';
import { Entry } from 'contentful';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CourseCategory } from '../components/Pages/CourseLibrary/CategoryTile';
import CourseFilters from '../components/Pages/CourseLibrary/CourseFilters';
import { ContentfulSingleVideoPageFields, Course } from '../models/contentful';
import { CategoryValue, SortValue } from '../pages/courses';

type SearchableItem = Course | Entry<ContentfulSingleVideoPageFields>;

export default function useCourseFilterSearch(
  courses: SearchableItem[],
  sectionTitle?: string,
  sectionSubtitle?: string
) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue>('All');
  const [selectedSort, setSelectedSort] = useState<SortValue>('newest');
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    return courses
      .reduce((cats, course) => {
        const categories = (course as Course).fields.category;
        if (categories) {
          categories.forEach((cat) => {
            const existingIndex = cats.findIndex((c) => c.id === cat.fields.slug);
            if (existingIndex >= 0) {
              cats[existingIndex].numberOfResults++;
              return;
            } else {
              cats.push({ id: cat.fields.slug, name: cat.fields.name, numberOfResults: 1 });
            }
          });
        }
        return cats;
      }, [] as CourseCategory[])
      .sort((a, b) => b.numberOfResults - a.numberOfResults);
  }, [courses]);

  const getFilteredCourses = () => {
    if (selectedCategory === 'All') return courses;
    return courses.filter((course) => {
      if ('category' in course.fields) {
        return course.fields?.category.map((cat) => cat.fields?.slug).includes(selectedCategory);
      }
      return false;
    });
  };

  const getSortedCourses = (coursesToSort: SearchableItem[]) => {
    switch (selectedSort) {
      case 'newest':
        return coursesToSort.sort((a, b) => {
          if (a.sys.createdAt > b.sys.createdAt) return -1;
          if (a.sys.createdAt < b.sys.createdAt) return 1;
          return 0;
        });
      case 'nameAscending':
        return [...coursesToSort].sort((a, b) => {
          if (a.fields.title > b.fields.title) return 1;
          if (a.fields.title < b.fields.title) return -1;
          return 0;
        });
      case 'nameDescending':
        return [...coursesToSort].sort((a, b) => {
          if (a.fields.title > b.fields.title) return -1;
          if (a.fields.title < b.fields.title) return 1;
          return 0;
        });
      default:
        throw new Error(`Unknown sort option: ${selectedSort}`);
    }
  };

  const getSearchedCourses = (coursesToSearch: SearchableItem[]) => {
    const normalizedSearchValue = searchValue.toLowerCase().trim();
    if (normalizedSearchValue.length > 1) {
      return coursesToSearch.filter((course) => {
        // We should do something smarter than this later when we have more courses
        if (course.fields.title.toLowerCase().includes(normalizedSearchValue)) return true;
        if ((course.fields.description?.toLowerCase() ?? '').includes(normalizedSearchValue)) return true;
        if ('creator' in course.fields) {
          if (course.fields.creator?.fields?.name.toLowerCase().includes(normalizedSearchValue)) return true;
        } else {
          return false;
        }
      });
    }
    return coursesToSearch;
  };

  const removeItemsHiddenFromSearch = (coursesToSearch: SearchableItem[]) => {
    return coursesToSearch.filter((item) => {
      const contentTypeId = item.sys.contentType.sys.id;
      if (contentTypeId === 'course') return true;
      if (contentTypeId === 'singleVideoPage') {
        return (item as Entry<ContentfulSingleVideoPageFields>).fields.showInSearch;
      }
      return true;
    });
  };

  const removeArchivedItems = (itemsToFilter: SearchableItem[]) => {
    return itemsToFilter.filter(
      (item) => !appConfig.archivedItems.map((archivedItem) => archivedItem.id).includes(item.sys.id)
    );
  };

  useEffect(() => {
    if (searchValue.trim().length > 1) {
      setSelectedCategory('All');
    }
  }, [searchValue]);

  useEffect(() => {
    if (selectedCategory !== 'All') {
      setSearchValue('');
    }
  }, [selectedCategory]);

  const matchingCourses = removeArchivedItems(
    removeItemsHiddenFromSearch(getSearchedCourses(getSortedCourses(getFilteredCourses())))
  );

  const userHasAppliedFilters = searchValue !== '' || selectedCategory !== 'All' || selectedSort !== 'newest';

  const filterComponent = (
    <CourseFilters
      ref={inputRef}
      selectedCategoryId={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedSortId={selectedSort}
      setSelectedSort={setSelectedSort}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      categories={categories}
      sectionTitle={sectionTitle}
      sectionSubtitle={sectionSubtitle}
    />
  );

  return {
    setSelectedCategory,
    filterComponent,
    userHasAppliedFilters,
    matchingCourses,
    inputRef,
  };
}
