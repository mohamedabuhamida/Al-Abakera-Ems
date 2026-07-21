// hooks/useStudentForm.ts

import { useState, useCallback, useEffect } from "react";
import { Student } from "@/core/types";
import { getStagesAndGrades, getGroupsForStudent } from "../actions";
import { useLanguage } from "@/core/i18n/useLanguage";

type BalanceFilter = "all" | "with-balance" | "without-balance";

export function useStudentForm() {
  const [stages, setStages] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addStep, setAddStep] = useState(0);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+20");
  const { language } = useLanguage();

  const [newStudent, setNewStudent] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    educational_stage: "",
    grade: "",
    parent_name: "",
    whatsapp_number: "",
    school: "",
    status: "active" as Student["status"],
    group_ids: [] as string[],
  });

  // Generate student code
  const generatedStudentCode = useCallback(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `AL-${year}-${randomNum}`;
  }, []);

  const [currentStudentCode, setCurrentStudentCode] = useState(
    generatedStudentCode(),
  );

  // Regenerate code when needed
  const regenerateStudentCode = useCallback(() => {
    setCurrentStudentCode(generatedStudentCode());
  }, [generatedStudentCode]);

  // Fetch groups
  const fetchGroups = useCallback(async (gradeId?: string) => {
    setIsLoadingGroups(true);
    try {
      const result = await getGroupsForStudent(gradeId);
      if (result.success && result.data) {
        setGroups(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  // When grade changes, refetch groups
  useEffect(() => {
    if (newStudent.grade) {
      fetchGroups(newStudent.grade);
    } else {
      fetchGroups();
    }
  }, [newStudent.grade, fetchGroups]);

  // Fetch stages and grades
  useEffect(() => {
  async function fetchStagesAndGrades() {
    setIsLoadingStages(true);
    try {
      const result = await getStagesAndGrades();
      if (result.success && result.data) {
        setStages(result.data);
        // Flatten all grades for the grade dropdown when no stage is selected
        const allGrades = result.data.flatMap((stage: any) =>
          stage.grades.map((grade: any) => ({
            ...grade,
            id: grade.id, // Ensure ID is preserved
            stage_name: language === "ar" ? stage.name_ar : stage.name_en,
            stage_id: stage.id,
          }))
        );
        setGrades(allGrades);
      }
    } catch (err) {
      console.error("Failed to fetch stages and grades:", err);
    } finally {
      setIsLoadingStages(false);
    }
  }
  fetchStagesAndGrades();
}, [language]);

  const handleStageChange = (stageId: string) => {
    setSelectedStageId(stageId);
    if (stageId) {
      const selectedStage = stages.find((s) => s.id === stageId);
      if (selectedStage) {
        const stageGrades = selectedStage.grades.map((grade: any) => ({
          ...grade,
          stage_name: selectedStage.name_ar || selectedStage.name_en,
          stage_id: selectedStage.id,
        }));
        setGrades(stageGrades);
        // Clear selected grade when stage changes
        updateNewStudent("grade", "");
      }
    } else {
      // Show all grades when no stage is selected
      const allGrades = stages.flatMap((stage: any) =>
        stage.grades.map((grade: any) => ({
          ...grade,
          stage_name: stage.name_ar || stage.name_en,
          stage_id: stage.id,
        })),
      );
      setGrades(allGrades);
    }
  };

  const updateNewStudent = (field: string, value: string) => {
    setNewStudent((current) => ({
      ...current,
      [field]: field === "status" && value !== "inactive" ? "active" : value,
    }));
  };

  const handleGradeChange = useCallback(
    async (gradeId: string) => {
      updateNewStudent("grade", gradeId);
      // Refetch groups filtered by grade
      if (gradeId) {
        setIsLoadingGroups(true);
        try {
          const result = await getGroupsForStudent(gradeId);
          if (result.success && result.data) {
            setGroups(result.data);
          }
        } catch (err) {
          console.error("Failed to fetch filtered groups:", err);
        } finally {
          setIsLoadingGroups(false);
        }
      } else {
        // If no grade selected, fetch all groups
        setIsLoadingGroups(true);
        try {
          const result = await getGroupsForStudent();
          if (result.success && result.data) {
            setGroups(result.data);
          }
        } catch (err) {
          console.error("Failed to fetch groups:", err);
        } finally {
          setIsLoadingGroups(false);
        }
      }
    },
    [updateNewStudent],
  );

  const resetForm = () => {
    setNewStudent({
      full_name: "",
      date_of_birth: "",
      gender: "",
      blood_group: "",
      educational_stage: "",
      grade: "",
      parent_name: "",
      whatsapp_number: "",
      school: "",
      status: "active",
      group_ids: [],
    });
    setSelectedStageId("");
    setAddStep(0);
    setCurrentStudentCode(generatedStudentCode());
  };

  const getGradeName = (gradeId: string) => {
    const grade = grades.find((g) => g.id === gradeId);
    return grade ? grade.name_ar || grade.name_en : "";
  };

  const getStageName = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? stage.name_ar || stage.name_en : "";
  };

  // Step validation
  const isStepValid = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return newStudent.full_name.trim().length > 0;
        case 1:
          return true;
        case 2:
          return true;
        case 3:
          return true;
        default:
          return true;
      }
    },
    [newStudent.full_name],
  );

  // Step navigation
  const handleStepChange = (targetStep: number) => {
    if (targetStep > addStep && !isStepValid(addStep)) {
      return false;
    }
    if (targetStep < addStep) {
      setAddStep(targetStep);
      return true;
    }
    setAddStep(targetStep);
    return true;
  };

  const handleNextStep = () => {
    if (addStep < 3) {
      if (!isStepValid(addStep)) {
        return false;
      }
      setAddStep(addStep + 1);
      return true;
    }
    return false;
  };

  const handlePreviousStep = () => {
    if (addStep > 0) {
      setAddStep(addStep - 1);
      return true;
    }
    return false;
  };

  return {
    // State
    stages,
    grades,
    isLoadingStages,
    selectedStageId,
    groups,
    isLoadingGroups,
    isAddOpen,
    setIsAddOpen,
    addStep,
    setAddStep,
    selectedCountryCode,
    setSelectedCountryCode,
    newStudent,
    setNewStudent,
    generatedStudentCode: currentStudentCode,
    regenerateStudentCode,
    handleGradeChange,
    // Functions
    updateNewStudent,
    resetForm,
    handleStageChange,
    getGradeName,
    getStageName,
    isStepValid,
    handleStepChange,
    handleNextStep,
    handlePreviousStep,
  };
}
