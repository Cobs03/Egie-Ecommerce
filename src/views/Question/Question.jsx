import React, { useState } from "react";
import { FaArrowRight, FaArrowLeft, FaCheck } from "react-icons/fa";

const PCBuildQuestionnaire = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    pcPurpose: [],
    otherPurpose: "",
    budgetRange: "",
    preferredBrands: [],
    monitorResolution: "",
    gameGenres: "",
    rayTracing: "",
    storagePreference: "",
    upgradeability: "",
    aesthetics: "",
    additionalNeeds: [],
    otherNeeds: "",
  });

  const totalSteps = 9;

  // Handle checkbox changes (for multi-select questions)
  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      if (prev[field].includes(value)) {
        return {
          ...prev,
          [field]: prev[field].filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [field]: [...prev[field], value],
        };
      }
    });
  };

  // Handle radio button changes (for single-select questions)
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  // Progress bar calculation
  const progressPercentage = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg flex flex-col h-[490px] mt-32.5 max-md:mt-22.5 overflow-y-auto">
      {/* Header - Fixed height */}
      <div className="p-6 pb-2 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Custom PC Build Questionnaire
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Help us understand your needs so we can recommend the perfect PC build
          for you.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-right text-sm text-gray-500 mt-1">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        {/* Question content - Scrollable, fixed height */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {/* Step 1: Purpose of the PC */}
          {currentStep === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-2">
                1. Purpose of the PC
              </h2>
              <p className="text-gray-600 mb-3">Select all that apply</p>

              <div className="space-y-2">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="officeSchool"
                    className="mt-1"
                    checked={formData.pcPurpose.includes("Office / School")}
                    onChange={() =>
                      handleCheckboxChange("pcPurpose", "Office / School")
                    }
                  />
                  <label htmlFor="officeSchool" className="ml-2">
                    Office / School (Word, Excel, Browsing)
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="casualGaming"
                    className="mt-1"
                    checked={formData.pcPurpose.includes("Casual Gaming")}
                    onChange={() =>
                      handleCheckboxChange("pcPurpose", "Casual Gaming")
                    }
                  />
                  <label htmlFor="casualGaming" className="ml-2">
                    Casual Gaming
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="highEndGaming"
                    className="mt-1"
                    checked={formData.pcPurpose.includes("High-end Gaming")}
                    onChange={() =>
                      handleCheckboxChange("pcPurpose", "High-end Gaming")
                    }
                  />
                  <label htmlFor="highEndGaming" className="ml-2">
                    Competitive/High-end Gaming
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="contentCreation"
                    className="mt-1"
                    checked={formData.pcPurpose.includes("Content Creation")}
                    onChange={() =>
                      handleCheckboxChange("pcPurpose", "Content Creation")
                    }
                  />
                  <label htmlFor="contentCreation" className="ml-2">
                    Content Creation (Photo Editing, Video Editing, 3D
                    Rendering)
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="streaming"
                    className="mt-1"
                    checked={formData.pcPurpose.includes("Streaming")}
                    onChange={() =>
                      handleCheckboxChange("pcPurpose", "Streaming")
                    }
                  />
                  <label htmlFor="streaming" className="ml-2">
                    Streaming
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="development"
                    className="mt-1"
                    checked={formData.pcPurpose.includes(
                      "Software Development"
                    )}
                    onChange={() =>
                      handleCheckboxChange("pcPurpose", "Software Development")
                    }
                  />
                  <label htmlFor="development" className="ml-2">
                    Software Development / Programming
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="otherPurpose"
                    className="mt-1"
                    checked={formData.pcPurpose.includes("Other")}
                    onChange={() => handleCheckboxChange("pcPurpose", "Other")}
                  />
                  <label htmlFor="otherPurpose" className="ml-2">
                    Other:
                  </label>
                </div>

                {formData.pcPurpose.includes("Other") && (
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border border-gray-300 rounded"
                    value={formData.otherPurpose}
                    onChange={(e) =>
                      handleInputChange("otherPurpose", e.target.value)
                    }
                    placeholder="Please specify"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Budget Range */}
          {currentStep === 2 && (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-2">2. Budget Range</h2>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="budget1"
                    name="budgetRange"
                    checked={formData.budgetRange === "₱20,000 – ₱30,000"}
                    onChange={() =>
                      handleInputChange("budgetRange", "₱20,000 – ₱30,000")
                    }
                    className="form-radio"
                  />
                  <label htmlFor="budget1" className="ml-2">
                    ₱20,000 – ₱30,000
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="budget2"
                    name="budgetRange"
                    checked={formData.budgetRange === "₱30,001 – ₱50,000"}
                    onChange={() =>
                      handleInputChange("budgetRange", "₱30,001 – ₱50,000")
                    }
                    className="form-radio"
                  />
                  <label htmlFor="budget2" className="ml-2">
                    ₱30,001 – ₱50,000
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="budget3"
                    name="budgetRange"
                    checked={formData.budgetRange === "₱50,001 – ₱70,000"}
                    onChange={() =>
                      handleInputChange("budgetRange", "₱50,001 – ₱70,000")
                    }
                    className="form-radio"
                  />
                  <label htmlFor="budget3" className="ml-2">
                    ₱50,001 – ₱70,000
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="budget4"
                    name="budgetRange"
                    checked={formData.budgetRange === "₱70,001 – ₱100,000"}
                    onChange={() =>
                      handleInputChange("budgetRange", "₱70,001 – ₱100,000")
                    }
                    className="form-radio"
                  />
                  <label htmlFor="budget4" className="ml-2">
                    ₱70,001 – ₱100,000
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="budget5"
                    name="budgetRange"
                    checked={formData.budgetRange === "₱100,000+"}
                    onChange={() =>
                      handleInputChange("budgetRange", "₱100,000+")
                    }
                    className="form-radio"
                  />
                  <label htmlFor="budget5" className="ml-2">
                    ₱100,000+
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferred Brands */}
          {currentStep === 3 && (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-2">
                3. Preferred Brand(s)
              </h2>
              <p className="text-gray-600 mb-3">(optional)</p>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="intel"
                    checked={formData.preferredBrands.includes("Intel")}
                    onChange={() =>
                      handleCheckboxChange("preferredBrands", "Intel")
                    }
                  />
                  <label htmlFor="intel" className="ml-2">
                    Intel
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="amd"
                    checked={formData.preferredBrands.includes("AMD")}
                    onChange={() =>
                      handleCheckboxChange("preferredBrands", "AMD")
                    }
                  />
                  <label htmlFor="amd" className="ml-2">
                    AMD
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="nvidia"
                    checked={formData.preferredBrands.includes("NVIDIA")}
                    onChange={() =>
                      handleCheckboxChange("preferredBrands", "NVIDIA")
                    }
                  />
                  <label htmlFor="nvidia" className="ml-2">
                    NVIDIA (GPU)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="asus"
                    checked={formData.preferredBrands.includes("ASUS")}
                    onChange={() =>
                      handleCheckboxChange("preferredBrands", "ASUS")
                    }
                  />
                  <label htmlFor="asus" className="ml-2">
                    ASUS
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="msi"
                    checked={formData.preferredBrands.includes("MSI")}
                    onChange={() =>
                      handleCheckboxChange("preferredBrands", "MSI")
                    }
                  />
                  <label htmlFor="msi" className="ml-2">
                    MSI
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gigabyte"
                    checked={formData.preferredBrands.includes("Gigabyte")}
                    onChange={() =>
                      handleCheckboxChange("preferredBrands", "Gigabyte")
                    }
                  />
                  <label htmlFor="gigabyte" className="ml-2">
                    Gigabyte
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="noPreference"
                    checked={formData.preferredBrands.includes(
                      "Doesn't matter"
                    )}
                    onChange={() =>
                      handleCheckboxChange("preferredBrands", "Doesn't matter")
                    }
                  />
                  <label htmlFor="noPreference" className="ml-2">
                    Doesn't matter
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Monitor Resolution */}
          {currentStep === 4 && (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-2">
                4. Monitor Resolution / Target Performance
              </h2>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="res1080p60"
                    name="monitorResolution"
                    checked={formData.monitorResolution === "1080p 60Hz"}
                    onChange={() =>
                      handleInputChange("monitorResolution", "1080p 60Hz")
                    }
                  />
                  <label htmlFor="res1080p60" className="ml-2">
                    1080p 60Hz (basic smooth performance)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="res1080p144"
                    name="monitorResolution"
                    checked={formData.monitorResolution === "1080p 144Hz"}
                    onChange={() =>
                      handleInputChange("monitorResolution", "1080p 144Hz")
                    }
                  />
                  <label htmlFor="res1080p144" className="ml-2">
                    1080p 144Hz (competitive gaming)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="res1440p"
                    name="monitorResolution"
                    checked={formData.monitorResolution === "1440p"}
                    onChange={() =>
                      handleInputChange("monitorResolution", "1440p")
                    }
                  />
                  <label htmlFor="res1440p" className="ml-2">
                    1440p (QHD, sharper visuals)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="res4k"
                    name="monitorResolution"
                    checked={formData.monitorResolution === "4K"}
                    onChange={() =>
                      handleInputChange("monitorResolution", "4K")
                    }
                  />
                  <label htmlFor="res4k" className="ml-2">
                    4K (Ultra HD, high-end setup)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Gaming Preferences */}
          {currentStep === 5 && (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-2">
                5. Gaming Preferences
              </h2>
              <p className="text-gray-600 mb-3">(if gaming PC)</p>

              <div className="mb-4">
                <label className="block mb-2">Favorite game genres:</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={formData.gameGenres}
                  onChange={(e) =>
                    handleInputChange("gameGenres", e.target.value)
                  }
                  placeholder="e.g., FPS, MOBA, Strategy, RPG"
                />
              </div>

              <div>
                <p className="mb-2">Do you want Ray Tracing support?</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="rayTracingYes"
                      name="rayTracing"
                      checked={formData.rayTracing === "Yes"}
                      onChange={() => handleInputChange("rayTracing", "Yes")}
                    />
                    <label htmlFor="rayTracingYes" className="ml-2">
                      Yes
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="rayTracingNo"
                      name="rayTracing"
                      checked={formData.rayTracing === "No"}
                      onChange={() => handleInputChange("rayTracing", "No")}
                    />
                    <label htmlFor="rayTracingNo" className="ml-2">
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Storage Preference */}
          {currentStep === 6 && (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-2">
                6. Storage Preference
              </h2>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="ssdOnly"
                    name="storagePreference"
                    checked={formData.storagePreference === "SSD only"}
                    onChange={() =>
                      handleInputChange("storagePreference", "SSD only")
                    }
                  />
                  <label htmlFor="ssdOnly" className="ml-2">
                    SSD only (faster, less storage)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="ssdHdd"
                    name="storagePreference"
                    checked={formData.storagePreference === "SSD + HDD"}
                    onChange={() =>
                      handleInputChange("storagePreference", "SSD + HDD")
                    }
                  />
                  <label htmlFor="ssdHdd" className="ml-2">
                    SSD + HDD (speed + large storage)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="noStoragePreference"
                    name="storagePreference"
                    checked={formData.storagePreference === "Doesn't matter"}
                    onChange={() =>
                      handleInputChange("storagePreference", "Doesn't matter")
                    }
                  />
                  <label htmlFor="noStoragePreference" className="ml-2">
                    Doesn't matter
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Upgradeability Preference */}
          {currentStep === 7 && (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-2">
                7. Upgradeability Preference
              </h2>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="upgradeLater"
                    name="upgradeability"
                    checked={
                      formData.upgradeability ===
                      "I want a budget PC now, but I'll upgrade later"
                    }
                    onChange={() =>
                      handleInputChange(
                        "upgradeability",
                        "I want a budget PC now, but I'll upgrade later"
                      )
                    }
                  />
                  <label htmlFor="upgradeLater" className="ml-2">
                    I want a budget PC now, but I'll upgrade later
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="bestNow"
                    name="upgradeability"
                    checked={
                      formData.upgradeability ===
                      "I want the best long-term build possible now"
                    }
                    onChange={() =>
                      handleInputChange(
                        "upgradeability",
                        "I want the best long-term build possible now"
                      )
                    }
                  />
                  <label htmlFor="bestNow" className="ml-2">
                    I want the best long-term build possible now
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Aesthetics */}
          {currentStep === 8 && (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-2">8. Aesthetics</h2>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="aestheticsNoPreference"
                    name="aesthetics"
                    checked={formData.aesthetics === "Doesn't matter"}
                    onChange={() =>
                      handleInputChange("aesthetics", "Doesn't matter")
                    }
                  />
                  <label htmlFor="aestheticsNoPreference" className="ml-2">
                    Doesn't matter
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="rgbGaming"
                    name="aesthetics"
                    checked={
                      formData.aesthetics === "RGB lighting / gaming aesthetics"
                    }
                    onChange={() =>
                      handleInputChange(
                        "aesthetics",
                        "RGB lighting / gaming aesthetics"
                      )
                    }
                  />
                  <label htmlFor="rgbGaming" className="ml-2">
                    RGB lighting / gaming aesthetics
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="minimalist"
                    name="aesthetics"
                    checked={
                      formData.aesthetics === "Minimalist / professional look"
                    }
                    onChange={() =>
                      handleInputChange(
                        "aesthetics",
                        "Minimalist / professional look"
                      )
                    }
                  />
                  <label htmlFor="minimalist" className="ml-2">
                    Minimalist / professional look
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 9: Additional Needs */}
          {currentStep === 9 && (
            <div className="space-y-3 animate-fadeIn">
              <h2 className="text-xl font-semibold mb-2">
                9. Additional Needs
              </h2>

              <div className="space-y-2">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="wifi"
                    className="mt-1"
                    checked={formData.additionalNeeds.includes("Wi-Fi support")}
                    onChange={() =>
                      handleCheckboxChange("additionalNeeds", "Wi-Fi support")
                    }
                  />
                  <label htmlFor="wifi" className="ml-2">
                    Wi-Fi support
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="bluetooth"
                    className="mt-1"
                    checked={formData.additionalNeeds.includes(
                      "Bluetooth support"
                    )}
                    onChange={() =>
                      handleCheckboxChange(
                        "additionalNeeds",
                        "Bluetooth support"
                      )
                    }
                  />
                  <label htmlFor="bluetooth" className="ml-2">
                    Bluetooth support
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="extraUsb"
                    className="mt-1"
                    checked={formData.additionalNeeds.includes(
                      "Extra USB ports"
                    )}
                    onChange={() =>
                      handleCheckboxChange("additionalNeeds", "Extra USB ports")
                    }
                  />
                  <label htmlFor="extraUsb" className="ml-2">
                    Extra USB ports
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="liquidCooling"
                    className="mt-1"
                    checked={formData.additionalNeeds.includes(
                      "Liquid cooling"
                    )}
                    onChange={() =>
                      handleCheckboxChange("additionalNeeds", "Liquid cooling")
                    }
                  />
                  <label htmlFor="liquidCooling" className="ml-2">
                    Liquid cooling
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="quiet"
                    className="mt-1"
                    checked={formData.additionalNeeds.includes(
                      "Quiet operation"
                    )}
                    onChange={() =>
                      handleCheckboxChange("additionalNeeds", "Quiet operation")
                    }
                  />
                  <label htmlFor="quiet" className="ml-2">
                    Quiet operation
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="otherNeeds"
                    className="mt-1"
                    checked={formData.additionalNeeds.includes("Other")}
                    onChange={() =>
                      handleCheckboxChange("additionalNeeds", "Other")
                    }
                  />
                  <label htmlFor="otherNeeds" className="ml-2">
                    Other:
                  </label>
                </div>

                {formData.additionalNeeds.includes("Other") && (
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border border-gray-300 rounded"
                    value={formData.otherNeeds}
                    onChange={(e) =>
                      handleInputChange("otherNeeds", e.target.value)
                    }
                    placeholder="Please specify"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons - Fixed at bottom */}
        <div className="p-6 pt-4 flex-shrink-0 border-t flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-lg flex items-center ${
              currentStep === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            <FaArrowLeft className="mr-2" /> Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center"
            >
              Next <FaArrowRight className="ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center"
            >
              Submit <FaCheck className="ml-2" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PCBuildQuestionnaire;