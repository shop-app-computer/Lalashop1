"use client";
import React, { useRef } from "react";
import { Info, Upload, CheckCircle2, ChevronDown, HelpCircle } from "lucide-react";
import { countries } from "./constants";

interface Props {
  businessType: string | null;
  data: any;
  setData: (val: any) => void;
  errors: Record<string, boolean>;
}

export default function Step3Identity({ businessType, data, setData, errors }: Props) {
  const isIndividual = businessType === 'individual';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const updateFields = (patch: Record<string, any>) => {
    setData({ ...data, ...patch });
  };

  const updateField = (field: string, value: any) => {
    updateFields({ [field]: value });
  };

  const previewUrl = data.idPreview || null;
  const licensePreview = data.licensePreview || null;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileField: string,
    previewField: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateFields({ [fileField]: file, [previewField]: url });
    }
  };

  const getDocLabel = () => {
    switch (businessType) {
      case 'sole_proprietor': return "Business Registration Certificate";
      case 'corporate': return "Company Business License";
      case 'partnership': return "Partnership Agreement";
      default: return "Identity Document";
    }
  };

  // Prepare data for various options
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 80 }, (_, i) => (currentYear - 18 - i).toString());
  const expiryYears = Array.from({ length: 20 }, (_, i) => (currentYear + i).toString());

  const usStates = [
    "California", "New York", "Texas", "Florida", "Washington", "Illinois", "Georgia"
  ];
  
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 font-sans text-dark">
      
      {/* --- Main Header Section --- */}
      <div className="space-y-2">
        <h2 className="text-[28px] font-bold tracking-tight text-dark">
            {isIndividual ? "Primary Representative" : "Legal Entity Information"}
        </h2>
        <p className="text-[12px] text-gray-500 font-medium">
          This information will be used and stored for identity verification, screening, and fraud prevention purposes.
        </p>
      </div>

      {/* --- SECTION 1: Business Documents (NEW for non-individual) --- */}
      {!isIndividual && (
        <section className="bg-white border border-gray-100 rounded-xl p-8 space-y-6 shadow-sm">
          <h3 className="text-[18px] font-bold">Business Documents</h3>
          <div className="space-y-4">
             <label className="text-[14px] font-bold text-gray-700">Tax Identification Number (TIN)</label>
             <input 
                type="text" value={data.tinNumber || ""} 
                onChange={(e) => updateField("tinNumber", e.target.value)}
                placeholder="Enter 10-digit TIN" 
                className={`w-full p-3 border rounded-md outline-none focus:border-primary text-[14px] font-bold ${errors.tinNumber ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`} 
              />
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-[14px] font-bold text-gray-700">Upload {getDocLabel()}</p>
            <div className="flex gap-4 pt-2">
              <div 
                onClick={() => licenseInputRef.current?.click()}
                className={`w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-primary hover:bg-gray-50 cursor-pointer transition-all ${errors.licenseFile ? 'border-red-500' : 'border-gray-border'}`}
              >
                 <input type="file" ref={licenseInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "licenseFile", "licensePreview")} />
                 {licensePreview ? (
                   <div className="w-full h-full p-2"><img src={licensePreview} className="w-full h-full object-contain" /></div>
                 ) : (
                   <>
                     <Upload size={24} />
                     <span className="text-[12px] font-bold mt-2 tracking-tight uppercase">Click to upload document</span>
                   </>
                 )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- SECTION 2: Identity Documents --- */}
      <section className="bg-white border border-gray-100 rounded-xl p-8 space-y-6 shadow-sm">
        <h3 className="text-[18px] font-bold">{isIndividual ? "Identity Documents" : "Representative Identity"}</h3>
        
        {/* ... rest of identity doc UI ... */}
        
        <div className="space-y-4">
          <p className="text-[14px] font-bold text-gray-700">ID Type:</p>
          <div className="flex flex-wrap gap-6">
            {[
              { id: "passport", label: "Passport" },
              { id: "state_id", label: "National ID Card" },
            ].map((item) => (
              <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${data.idType === item.id ? "border-primary" : "border-gray-300"}`}>
                  {data.idType === item.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
                <input type="radio" className="hidden" name="idType" value={item.id} onChange={(e) => updateField("idType", e.target.value)} />
                <span className="text-[14px] font-medium text-gray-700 group-hover:text-black">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <p className="text-[14px] font-bold text-gray-700">Upload</p>
          <ul className="text-[13px] text-gray-500 space-y-1 list-disc pl-5 leading-relaxed font-medium">
            <li>Upload images of both biometric pages of your passport...</li>
            <li>Files must be smaller than 10 MB in JPG, PNG, JPEG, or PDF format.</li>
            <li>Ensure the image clearly shows all information on your ID...</li>
          </ul>

          <div className="flex gap-4 pt-2">
            {/* Sample Image */}
            <div className="w-24 h-32 border border-gray-200 rounded-md bg-gray-50 flex flex-col overflow-hidden text-center relative">
               {previewUrl ? (
                 <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
               ) : (
                 <div className="flex-1 bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">Sample Image</div>
               )}
               <div className="bg-gray-600 text-white text-[10px] py-1">Sample</div>
            </div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-24 h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-primary hover:bg-gray-50 cursor-pointer transition-all ${errors.idFile ? 'border-red-500' : 'border-gray-border'}`}
            >
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, "idFile", "idPreview")} />
               <Upload size={20} />
               <span className="text-[10px] font-bold mt-1">Upload</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: Add Personal Information --- */}
      <section className="bg-white border border-gray-100 rounded-xl p-8 space-y-8 shadow-sm">
        <h3 className="text-[18px] font-bold">Add Your Personal Information</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg flex gap-3 items-center border border-gray-100">
           <Info size={18} className="text-gray-400 shrink-0" />
           <p className="text-[13px] text-gray-600 font-medium">Ensure that all information entered below matches exactly what appears on your uploaded ID.</p>
        </div>

        <div className="space-y-6">
          {/* Legal Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-bold">Legal Name</label>
              <HelpCircle size={14} className="text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                type="text" value={data.firstName} 
                onChange={(e) => { if (e.target.value === "" || /^[a-zA-Z\s]*$/.test(e.target.value)) updateField("firstName", e.target.value); }}
                placeholder="First Name" 
                className={`p-3 border rounded-md outline-none focus:border-primary text-[14px] ${errors.firstName ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`} 
              />
              <input 
                type="text" value={data.middleName} 
                onChange={(e) => { if (e.target.value === "" || /^[a-zA-Z\s]*$/.test(e.target.value)) updateField("middleName", e.target.value); }}
                placeholder="Middle Name (Optional)" className="p-3 border border-gray-border rounded-md outline-none focus:border-primary text-[14px]" 
              />
              <input 
                type="text" value={data.lastName} 
                onChange={(e) => { if (e.target.value === "" || /^[a-zA-Z\s]*$/.test(e.target.value)) updateField("lastName", e.target.value); }}
                placeholder="Last Name" 
                className={`p-3 border rounded-md outline-none focus:border-primary text-[14px] ${errors.lastName ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`} 
              />
            </div>
          </div>

          {/* ID Number */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold">ID Number / Passport Number</label>
            <input 
              type="text" value={data.idNumber} 
              onChange={(e) => { if (e.target.value === "" || /^\d+$/.test(e.target.value)) updateField("idNumber", e.target.value); }}
              placeholder="Enter numbers only" 
              className={`w-full p-3 border rounded-md outline-none focus:border-primary text-[14px] ${errors.idNumber ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`} 
            />
          </div>

          {/* Date of Birth & Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[14px] font-bold">Date of Birth</label>
              <div className={`grid grid-cols-3 gap-2 p-1 rounded-lg ${errors.birthDate ? 'bg-red-50 ring-1 ring-red-500' : ''}`}>
                <Select value={data.birthMonth} onChange={(v: string) => updateField("birthMonth", v)} placeholder="Month" options={months} />
                <Select value={data.birthDay} onChange={(v: string) => updateField("birthDay", v)} placeholder="Day" options={days} />
                <Select value={data.birthYear} onChange={(v: string) => updateField("birthYear", v)} placeholder="Year" options={birthYears} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-bold">Expiry Date</label>
              <div className={`grid grid-cols-3 gap-2 p-1 rounded-lg ${errors.expiryDate ? 'bg-red-50 ring-1 ring-red-500' : ''}`}>
                <Select value={data.expiryMonth} onChange={(v: string) => updateField("expiryMonth", v)} placeholder="Month" options={months} />
                <Select value={data.expiryDay} onChange={(v: string) => updateField("expiryDay", v)} placeholder="Day" options={days} />
                <Select value={data.expiryYear} onChange={(v: string) => updateField("expiryYear", v)} placeholder="Year" options={expiryYears} />
              </div>
            </div>
          </div>

          {/* Residential Address */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-bold">Residential Address</label>
              <HelpCircle size={14} className="text-gray-400" />
            </div>
            <input 
              type="text" value={data.resAddress} onChange={(e) => updateField("resAddress", e.target.value)}
              placeholder="Street Address" 
              className={`w-full p-3 border rounded-md text-[14px] outline-none focus:border-primary ${errors.resAddress ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`} 
            />
            <input 
              type="text" value={data.apartment} onChange={(e) => updateField("apartment", e.target.value)}
              placeholder="Apartment, suite, building, etc. (Optional)" className="w-full p-3 border border-gray-border rounded-md text-[14px]" 
            />
            <div className="grid grid-cols-2 gap-3">
               <input 
                type="text" value={data.resCity} onChange={(e) => updateField("resCity", e.target.value)}
                placeholder="City" 
                className={`p-3 border rounded-md outline-none focus:border-primary text-[14px] ${errors.resCity ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`} 
               />
               <Select value={data.resState} onChange={(v: string) => updateField("resState", v)} error={errors.resState} placeholder="State" options={usStates} />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="relative">
                 <input 
                  type="text" value={data.resZip} 
                  onChange={(e) => { if (e.target.value === "" || /^\d+$/.test(e.target.value)) updateField("resZip", e.target.value); }}
                  placeholder="Postal Code" 
                  className={`w-full p-3 border rounded-md text-[14px] outline-none focus:border-primary ${errors.resZip ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`} 
                 />
               </div>
            </div>
          </div>

          {/* Address Options */}
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <p className="text-[14px] font-bold">Which option applies to the address you entered?</p>
            <div className="space-y-3">
              <RadioOption 
                label="This is a business address only. I understand that my address will be displayed on the product details page." 
                checked={data.addressOption === "business"} 
                onChange={() => updateField("addressOption", "business")} 
              />
              <RadioOption 
                label="This is also my residence. I certify that I do not have a business-only address." 
                checked={data.addressOption === "residential"} 
                onChange={() => updateField("addressOption", "residential")} 
              />
            </div>
          </div>

          
        </div>
      </section>
    </div>
  );
}

// Sub-components for clean code
interface SelectProps {
  placeholder: string;
  options: (string | number)[];
  defaultValue?: string | number;
  value?: string | number;
  onChange: (val: string) => void;
  error?: boolean;
}

function Select({ placeholder, options, defaultValue, value, onChange, error }: SelectProps) {
  return (
    <div className="relative w-full">
      <select 
        value={value || defaultValue || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 border rounded-md text-[14px] text-gray-700 outline-none focus:border-primary bg-white appearance-none cursor-pointer pr-10 ${error ? 'border-red-500 bg-red-50/10' : 'border-gray-border'}`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt: string | number, i: number) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function RadioOption({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group hover:text-dark" onClick={onChange}>
      <div className={`mt-1 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${checked ? "border-primary" : "border-gray-300 group-hover:border-primary"}`}>
         {checked && <div className="w-2.5 h-2.5 bg-primary rounded-full animate-in zoom-in duration-200" />}
      </div>
      <input type="radio" className="hidden" checked={checked} readOnly />
      <span className="text-[13px] font-medium text-gray-600 leading-relaxed group-hover:text-dark">{label}</span>
    </label>
  );
}