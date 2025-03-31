
import React from "react";
import { Customer } from "@/types";
import FormHeader from "./registration/FormHeader";
import CustomerInfoFields from "./registration/CustomerInfoFields";
import PreferencesSection from "./registration/PreferencesSection";
import SubmitButton from "./registration/SubmitButton";
import { useRegistrationForm } from "./registration/useRegistrationForm";

interface AdminRegistrationFormProps {
  onRegister: (customer: Customer) => void;
}

const AdminRegistrationForm: React.FC<AdminRegistrationFormProps> = ({ onRegister }) => {
  const {
    name,
    setName,
    preferences,
    isLoading,
    handlePreferenceChange,
    handlePartySizeChange,
    handleSubmit
  } = useRegistrationForm(onRegister);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-blue-100 overflow-hidden">
      <FormHeader />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <CustomerInfoFields
          name={name}
          setName={setName}
          onPartySizeChange={handlePartySizeChange}
          disabled={isLoading}
        />

        <PreferencesSection
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
          disabled={isLoading}
        />

        <SubmitButton isLoading={isLoading} />
      </form>
    </div>
  );
};

export default AdminRegistrationForm;
