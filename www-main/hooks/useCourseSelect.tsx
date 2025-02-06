import { useState } from 'react';
import Select, { SelectOption } from '../components/Select';
import { Course } from '../models/contentful';
import { CourseTitleWithId } from '../pages/admin';

const useCourseSelect = (allCourses: (CourseTitleWithId | Course)[]) => {
  const initialValue = { id: '', name: 'Select a Course', disabled: true };
  const [selectedCourse, setSelectedCourse] = useState<SelectOption>(initialValue);

  const resetSelectedCourse = () => {
    setSelectedCourse(initialValue);
  };

  const CourseSelect = ({ label = 'Select a Course' }) => (
    <Select
      label={label}
      options={[
        initialValue,
        ...allCourses
          .map((c) => ({ id: c.sys.id, name: c.fields.title }))
          .sort((a, b) => {
            if (a.name > b.name) {
              return 1;
            } else if (a.name < b.name) {
              return -1;
            }
            return 0;
          }),
      ]}
      selected={selectedCourse}
      setSelected={setSelectedCourse}
    />
  );

  return { CourseSelect, selectedCourse, resetSelectedCourse };
};

export default useCourseSelect;
