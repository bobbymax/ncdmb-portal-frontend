import { VendorResponseData } from "app/Repositories/Vendor/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useEffect, useRef, useState } from "react";
import TextInput from "../components/forms/TextInput";

interface AddressFields {
  street1: string;
  street2: string;
  city: string;
  state: string;
  poBox: string;
  country: string;
}

const Vendor: React.FC<FormPageComponentProps<VendorResponseData>> = ({
  state,
  setState,
  handleChange,
  loading,
  mode,
}) => {
  const [addressFields, setAddressFields] = useState<AddressFields>({
    street1: "",
    street2: "",
    city: "",
    state: "",
    poBox: "",
    country: "",
  });

  const hasParsedAddress = useRef(false);

  // Parse address string with markers back into individual fields
  const parseAddress = useCallback((addressString: string): AddressFields => {
    const fields: AddressFields = {
      street1: "",
      street2: "",
      city: "",
      state: "",
      poBox: "",
      country: "",
    };

    if (!addressString) return fields;

    // Check if address contains markers (formatted address)
    if (addressString.includes("|STREET1:")) {
      // Parse marked address
      const street1Match = addressString.match(/\|STREET1:([^|]*)\|/);
      const street2Match = addressString.match(/\|STREET2:([^|]*)\|/);
      const cityMatch = addressString.match(/\|CITY:([^|]*)\|/);
      const stateMatch = addressString.match(/\|STATE:([^|]*)\|/);
      const poBoxMatch = addressString.match(/\|POBOX:([^|]*)\|/);
      const countryMatch = addressString.match(/\|COUNTRY:([^|]*)\|/);

      fields.street1 = street1Match ? street1Match[1].trim() : "";
      fields.street2 = street2Match ? street2Match[1].trim() : "";
      fields.city = cityMatch ? cityMatch[1].trim() : "";
      fields.state = stateMatch ? stateMatch[1].trim() : "";
      fields.poBox = poBoxMatch ? poBoxMatch[1].trim() : "";
      fields.country = countryMatch ? countryMatch[1].trim() : "";
    }

    return fields;
  }, []);

  // Combine address fields into formatted string with markers
  const combineAddress = useCallback((fields: AddressFields): string => {
    const parts: string[] = [];

    if (fields.street1) parts.push(`|STREET1:${fields.street1}|`);
    if (fields.street2) parts.push(`|STREET2:${fields.street2}|`);
    if (fields.city) parts.push(`|CITY:${fields.city}|`);
    if (fields.state) parts.push(`|STATE:${fields.state}|`);
    if (fields.poBox) parts.push(`|POBOX:${fields.poBox}|`);
    if (fields.country) parts.push(`|COUNTRY:${fields.country}|`);

    // Also create a human-readable format
    const readableParts: string[] = [];
    if (fields.street1) readableParts.push(fields.street1);
    if (fields.street2) readableParts.push(fields.street2);
    if (fields.city) readableParts.push(fields.city);
    if (fields.state) readableParts.push(fields.state);
    if (fields.poBox) readableParts.push(`P.O. Box ${fields.poBox}`);
    if (fields.country) readableParts.push(fields.country);

    // Combine markers with readable format
    const markerString = parts.join("");
    const readableString = readableParts.join(", ");

    return markerString + readableString;
  }, []);

  // Parse address when in edit mode on initial load
  useEffect(() => {
    if (mode === "update" && state.address && !hasParsedAddress.current) {
      const parsed = parseAddress(state.address);
      setAddressFields(parsed);
      hasParsedAddress.current = true;
    }
  }, [mode, state.address, parseAddress]);

  // Update main state address whenever address fields change
  useEffect(() => {
    if (setState && hasParsedAddress.current) {
      const combinedAddress = combineAddress(addressFields);
      setState((prevState) => ({
        ...prevState,
        address: combinedAddress,
      }));
    } else if (setState && mode !== "update") {
      // For create mode, update immediately
      const combinedAddress = combineAddress(addressFields);
      setState((prevState) => ({
        ...prevState,
        address: combinedAddress,
      }));
    }
  }, [addressFields, combineAddress, setState, mode]);

  // Handle address field changes
  const handleAddressChange = useCallback(
    (field: keyof AddressFields) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAddressFields((prev) => ({
          ...prev,
          [field]: e.target.value,
        }));
      },
    []
  );

  const handleUploadLogo = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (setState) {
            setState((prevState) => ({
              ...prevState,
              logo: reader.result as string,
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [setState]
  );

  return (
    <>
      {/* Basic Information Section */}
      <div className="col-md-12 mb-4">
        <div className="card shadow-sm">
          <div
            className="card-header"
            style={{
              backgroundColor: "#f0f7f4",
              borderBottom: "2px solid #d4e9e2",
            }}
          >
            <h6 className="mb-0 text-dark">
              <i
                className="ri-information-line me-2"
                style={{ color: "#5a9279" }}
              ></i>
              Basic Information
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Vendor Name"
                  value={state.name}
                  name="name"
                  onChange={handleChange}
                  placeholder="Enter Vendor Name"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Representative Name"
                  value={state.representative_name}
                  name="representative_name"
                  onChange={handleChange}
                  placeholder="Enter Representative Name"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-12 mb-3">
                <TextInput
                  label="Authorising Representative"
                  value={state.authorising_representative}
                  name="authorising_representative"
                  onChange={handleChange}
                  placeholder="Enter Authorising Representative"
                  isDisabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="col-md-12 mb-4">
        <div className="card shadow-sm">
          <div
            className="card-header"
            style={{
              backgroundColor: "#f0f7f4",
              borderBottom: "2px solid #d4e9e2",
            }}
          >
            <h6 className="mb-0 text-dark">
              <i
                className="ri-phone-line me-2"
                style={{ color: "#5a9279" }}
              ></i>
              Contact Information
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 mb-3">
                <TextInput
                  label="Phone"
                  value={state.phone}
                  name="phone"
                  onChange={handleChange}
                  placeholder="Enter Phone Number"
                  type="text"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-4 mb-3">
                <TextInput
                  label="Email"
                  value={state.email}
                  name="email"
                  onChange={handleChange}
                  placeholder="Enter Email Address"
                  type="email"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-4 mb-3">
                <TextInput
                  label="Website"
                  value={state.website}
                  name="website"
                  onChange={handleChange}
                  placeholder="Enter Website URL"
                  type="text"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Street Address 1"
                  value={addressFields.street1}
                  name="street1"
                  onChange={handleAddressChange("street1")}
                  placeholder="Enter Street Address"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Street Address 2"
                  value={addressFields.street2}
                  name="street2"
                  onChange={handleAddressChange("street2")}
                  placeholder="Enter Apartment, Suite, etc. (Optional)"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-4 mb-3">
                <TextInput
                  label="City"
                  value={addressFields.city}
                  name="city"
                  onChange={handleAddressChange("city")}
                  placeholder="Enter City"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-4 mb-3">
                <TextInput
                  label="State"
                  value={addressFields.state}
                  name="state"
                  onChange={handleAddressChange("state")}
                  placeholder="Enter State"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-4 mb-3">
                <TextInput
                  label="P.O. Box"
                  value={addressFields.poBox}
                  name="poBox"
                  onChange={handleAddressChange("poBox")}
                  placeholder="Enter P.O. Box (Optional)"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-12 mb-3">
                <TextInput
                  label="Country"
                  value={addressFields.country}
                  name="country"
                  onChange={handleAddressChange("country")}
                  placeholder="Enter Country"
                  isDisabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Details Section */}
      <div className="col-md-12 mb-4">
        <div className="card shadow-sm">
          <div
            className="card-header"
            style={{
              backgroundColor: "#f0f7f4",
              borderBottom: "2px solid #d4e9e2",
            }}
          >
            <h6 className="mb-0 text-dark">
              <i
                className="ri-file-list-3-line me-2"
                style={{ color: "#5a9279" }}
              ></i>
              Registration Details
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 mb-3">
                <TextInput
                  label="NCEC Number"
                  value={state.ncec_no}
                  name="ncec_no"
                  onChange={handleChange}
                  placeholder="Enter NCEC Number"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-4 mb-3">
                <TextInput
                  label="CAC Number"
                  value={state.reg_no}
                  name="reg_no"
                  onChange={handleChange}
                  placeholder="Enter CAC Number"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-4 mb-3">
                <TextInput
                  label="TIN Number"
                  value={state.tin_number}
                  name="tin_number"
                  onChange={handleChange}
                  placeholder="Enter TIN Number"
                  isDisabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banking Information Section */}
      <div className="col-md-12 mb-4">
        <div className="card shadow-sm">
          <div
            className="card-header"
            style={{
              backgroundColor: "#f0f7f4",
              borderBottom: "2px solid #d4e9e2",
            }}
          >
            <h6 className="mb-0 text-dark">
              <i className="ri-bank-line me-2" style={{ color: "#5a9279" }}></i>
              Banking Information
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Bank Account Name"
                  value={state.bank_account_name}
                  name="bank_account_name"
                  onChange={handleChange}
                  placeholder="Enter Bank Account Name"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Bank Account Number"
                  value={state.bank_account_number}
                  name="bank_account_number"
                  onChange={handleChange}
                  placeholder="Enter Bank Account Number"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Bank Name"
                  value={state.bank_name}
                  name="bank_name"
                  onChange={handleChange}
                  placeholder="Enter Bank Name"
                  isDisabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <TextInput
                  label="Payment Code"
                  value={state.payment_code}
                  name="payment_code"
                  onChange={handleChange}
                  placeholder="Enter Payment Code"
                  isDisabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Upload Section */}
      <div className="col-md-12 mb-4">
        <div className="card shadow-sm">
          <div
            className="card-header"
            style={{
              backgroundColor: "#f0f7f4",
              borderBottom: "2px solid #d4e9e2",
            }}
          >
            <h6 className="mb-0 text-dark">
              <i
                className="ri-image-line me-2"
                style={{ color: "#5a9279" }}
              ></i>
              Logo & Branding
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-12 mb-3">
                <TextInput
                  label="Logo"
                  name="logo"
                  onChange={handleUploadLogo}
                  type="file"
                  accept="image/*"
                  isDisabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Vendor;
