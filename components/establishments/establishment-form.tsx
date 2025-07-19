"use client";

import React, { useState } from "react";
import BusinessTypeSelect from "./business-type-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface EstablishmentFormProps {
  onSubmit?: (data: any) => void;
}

const currentYear = new Date().getFullYear();

export default function EstablishmentForm({
  onSubmit,
}: EstablishmentFormProps) {
  const [form, setForm] = useState({
    name: "",
    businessType: "",
    yearEstablished: "",
    province: "",
    city: "",
    barangay: "",
    street: "",
    lat: "",
    lng: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.name.trim()) errs.name = "required.";
    if (!form.businessType)
      errs.businessType = "required.";
    if (!form.yearEstablished)
      errs.yearEstablished = "required.";
    else if (
      isNaN(Number(form.yearEstablished)) ||
      Number(form.yearEstablished) < 1900 ||
      Number(form.yearEstablished) > currentYear
    )
      errs.yearEstablished = `Year must be between 1900 and ${currentYear}.`;
    if (!form.province.trim()) errs.province = "required.";
    if (!form.city.trim()) errs.city = "required.";
    if (!form.barangay.trim()) errs.barangay = "required.";
    if (!form.street.trim()) errs.street = "required.";
    if (!form.postalCode.trim()) errs.postalCode = "required.";
    else if (!/^[0-9]{4,}$/.test(form.postalCode.trim()))
      errs.postalCode = "at least 4 digits.";
    if (form.lat && isNaN(Number(form.lat)))
      errs.lat = "Latitude must be a number.";
    if (form.lng && isNaN(Number(form.lng)))
      errs.lng = "Longitude must be a number.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    onSubmit?.(form);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main fields */}
      <div>
        <Label className="font-bold">Establishment Details</Label>
        <div className="flex justify-between items-center mb-1">
          <Label className="font-medium">Establishment Name *</Label>
          {errors.name && (
            <span className="text-red-500 text-sm ml-2 whitespace-nowrap">
              {errors.name}
            </span>
          )}
        </div>
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nature of Business (span 2) */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-1">
            <Label className="font-medium">Nature of Business *</Label>
            {errors.businessType && (
              <span className="text-red-500 text-sm ml-2 whitespace-nowrap">
                {errors.businessType}
              </span>
            )}
          </div>
          <BusinessTypeSelect
            name="businessType"
            value={form.businessType}
            onChange={handleChange}
          />
        </div>
        {/* Year Established */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="font-medium">Year Established *</Label>
            {errors.yearEstablished && (
              <span className="text-red-500 text-sm ml-2 whitespace-nowrap">
                {errors.yearEstablished}
              </span>
            )}
          </div>
          <Input
            name="yearEstablished"
            type="number"
            min={1900}
            max={currentYear}
            value={form.yearEstablished}
            onChange={handleChange}
          />
        </div>
      </div>
      {/* Address fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="font-medium">Province *</Label>
            {errors.province && (
              <span className="text-red-500 text-sm ml-2 whitespace-nowrap">{errors.province}</span>
            )}
          </div>
          <Input
            name="province"
            value={form.province}
            onChange={handleChange}
          />
        </div>
        {/* City/Municipality */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="font-medium">City/Municipality *</Label>
            {errors.city && (
              <span className="text-red-500 text-sm ml-2 whitespace-nowrap">{errors.city}</span>
            )}
          </div>
          <Input
            name="city"
            value={form.city}
            onChange={handleChange}
          />
        </div>
        {/* Barangay */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="font-medium">Barangay *</Label>
            {errors.barangay && (
              <span className="text-red-500 text-sm ml-2 whitespace-nowrap">{errors.barangay}</span>
            )}
          </div>
          <Input
            name="barangay"
            value={form.barangay}
            onChange={handleChange}
          />
        </div>
        {/* Street/Building (span 2) */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-1">
            <Label className="font-medium">Street/Building *</Label>
            {errors.street && (
              <span className="text-red-500 text-sm ml-2 whitespace-nowrap">{errors.street}</span>
            )}
          </div>
          <Input
            name="street"
            value={form.street}
            onChange={handleChange}
          />
        </div>
        {/* Postal Code */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="font-medium">Postal Code *</Label>
            {errors.postalCode && (
              <span className="text-red-500 text-sm ml-2 whitespace-nowrap">{errors.postalCode}</span>
            )}
          </div>
          <Input
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
          />
        </div>
      </div>
      {/* Lat/Lng fields */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <Label className="font-medium">Latitude</Label>
            {errors.lat && (
              <span className="text-red-500 text-sm ml-2 whitespace-nowrap">
                {errors.lat}
              </span>
            )}
          </div>
          <Input
            name="lat"
            value={form.lat}
            onChange={handleChange}
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <Label className="font-medium">Longitude</Label>
            {errors.lng && (
              <span className="text-red-500 text-sm ml-2 whitespace-nowrap">
                {errors.lng}
              </span>
            )}
          </div>
          <Input
            name="lng"
            value={form.lng}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Establishment"}
        </Button>
      </div>
    </form>
  );
}
