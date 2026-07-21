// hooks/useStudentEdit.ts

import { useState, useCallback } from "react";
import { Student } from "@/core/types";
import { updateStudent, updateStudentGroups, getStudentGroups } from "../actions";

export function useStudentEdit(stages: any[], grades: any[], language: string) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+20");

  const [formData, setFormData] = useState({
    full_name: "",
    parent_name: "",
    whatsapp_number: "",
    educational_stage: "",
    grade: "",
    school: "",
    status: "active" as Student["status"],
  });

  const openEditModal = async (student: Student) => {
    console.log("Opening edit modal for student:", student);
    
    setEditingStudent(student);
    setSelectedCountryCode("+20");

    // IMPORTANT: Find the grade in the grades list
    // The student.grade might be the ID or the name
    let foundGradeId = "";
    let foundStageId = "";
    let foundStageName = "";

    // First, try to find the grade by ID
    if (student.grade) {
      // Check if student.grade is an ID or a name
      const gradeById = grades.find((g) => g.id === student.grade);
      const gradeByName = grades.find((g) => g.name_ar === student.grade || g.name_en === student.grade);
      
      const gradeObj = gradeById || gradeByName;
      
      if (gradeObj) {
        foundGradeId = gradeObj.id;
        // Set the grade in formData using the ID
        setFormData((prev) => ({ 
          ...prev, 
          grade: foundGradeId 
        }));
        
        // Find the stage for this grade
        const stageObj = stages.find((s) => s.id === gradeObj.stage_id);
        if (stageObj) {
          foundStageId = stageObj.id;
          foundStageName = language === "ar" ? stageObj.name_ar : stageObj.name_en;
          setSelectedStageId(foundStageId);
          
          // Set the educational_stage name for display
          setFormData((prev) => ({ 
            ...prev, 
            educational_stage: foundStageName 
          }));
        }
      } else {
        // If grade not found, set grade as empty but keep the educational_stage
        setFormData((prev) => ({ 
          ...prev, 
          grade: "",
          educational_stage: student.educational_stage || ""
        }));
      }
    } else {
      // If no grade, reset
      setFormData((prev) => ({ 
        ...prev, 
        grade: "",
        educational_stage: ""
      }));
      setSelectedStageId("");
    }

    // Populate the rest of the form data
    setFormData((prev) => ({
      ...prev,
      full_name: student.full_name || "",
      parent_name: student.parent_name || "",
      whatsapp_number: student.whatsapp_number || "",
      school: student.school || "",
      status: student.status || "active",
    }));

    // Fetch student's current groups
    try {
      const result = await getStudentGroups(student.id);
      if (result.success && result.data) {
        const groupIds = result.data.map((e: any) => e.group_id);
        setSelectedGroups(groupIds);
      } else {
        setSelectedGroups([]);
      }
    } catch (err) {
      console.error("Failed to fetch student groups:", err);
      setSelectedGroups([]);
    }

    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStudent(null);
    setSelectedGroups([]);
    setSelectedStageId("");
    setFormData({
      full_name: "",
      parent_name: "",
      whatsapp_number: "",
      educational_stage: "",
      grade: "",
      school: "",
      status: "active",
    });
  };

  const updateEditingStudent = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: field === "status" && value !== "inactive" ? "active" : value,
    }));
  };

  return {
    isEditModalOpen,
    setIsEditModalOpen,
    editingStudent,
    formData,
    selectedGroups,
    setSelectedGroups,
    selectedStageId,
    setSelectedStageId,
    selectedCountryCode,
    setSelectedCountryCode,
    openEditModal,
    closeEditModal,
    updateEditingStudent,
  };
}