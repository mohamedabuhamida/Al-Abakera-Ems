"use client";

import { Search, Filter, Download, RefreshCw, UserPlus } from "lucide-react";

interface StudentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: (value: boolean) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  gradeFilter: string;
  setGradeFilter: (value: string) => void;
  balanceFilter: string;
  setBalanceFilter: (value: string) => void;
  gradeOptions: string[];
  clearFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onAddStudent: () => void;
  language: string;
  content: any;
}

export function StudentFilters({
  searchTerm,
  setSearchTerm,
  isFiltersOpen,
  setIsFiltersOpen,
  statusFilter,
  setStatusFilter,
  gradeFilter,
  setGradeFilter,
  balanceFilter,
  setBalanceFilter,
  gradeOptions,
  clearFilters,
  onRefresh,
  onExport,
  onAddStudent,
  language,
  content,
}: StudentFiltersProps) {
  return (
    <>
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label-caps">Student Registry</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-9 tracking-[-0.01em] text-on-surface">
            الطلاب
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
            إدارة ملفات الطلاب من قاعدة البيانات الجديدة: الصف، المرحلة، ولي الأمر، المجموعات، والحالة المالية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="btn-secondary"
          >
            <Filter size={16} />
            تصفية
          </button>
          <button type="button" onClick={onExport} className="btn-secondary">
            <Download size={16} />
            تصدير
          </button>
          <button type="button" onClick={onAddStudent} className="btn-primary">
            <UserPlus size={16} />
            طالب جديد
          </button>
        </div>
      </div>

      {isFiltersOpen && (
        <section className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">فلاتر الطلاب</h2>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-primary"
            >
              مسح الفلاتر
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="input-field"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
            <select
              value={gradeFilter}
              onChange={(event) => setGradeFilter(event.target.value)}
              className="input-field"
            >
              <option value="all">كل الصفوف</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <select
              value={balanceFilter}
              onChange={(event) => setBalanceFilter(event.target.value)}
              className="input-field"
            >
              <option value="all">كل الأرصدة</option>
              <option value="with-balance">لديه رصيد</option>
              <option value="without-balance">بدون رصيد</option>
            </select>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 border-b border-outline-variant p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex h-10 w-full items-center gap-2 rounded-default border border-outline-variant bg-surface-container-low px-3 xl:max-w-md">
          <Search size={16} className="text-on-surface-variant" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ابحث بالاسم أو الكود أو ولي الأمر"
            className="w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
          />
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="btn-secondary self-start xl:self-auto"
        >
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>
    </>
  );
}