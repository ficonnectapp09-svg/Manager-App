import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ManagerRole } from '../../types';
import { FICTextInput } from '../../components/ui/FICTextInput';
import { FICButton } from '../../components/ui/FICButton';
import { FICDropdownModal } from '../../components/ui/FICDropdownModal';
import { useTheme } from '../../hooks/useTheme';
import { cameraLocationService } from '../../services/camera/CameraLocationService';
import {
  registrationApi,
  TerritoryItem,
  CapacityCheckResult,
} from '../../services/api/registrationApi';
import {
  formatName,
  validateName,
  normalizeEmail,
  validateEmail,
  validateMobile,
  validatePassword,
  validatePasswordMatch,
  validateAadhaar,
  validatePan,
  validateAccountNumber,
  validateAccountNumberMatch,
  validateIfsc,
  validateDob,
  validateLocationName,
  validatePincode,
} from '../../utils/validation';

export interface RegisterScreenProps {
  onBackToLogin: () => void;
  onRegisterSuccess?: () => void;
}

const ROLES = [
  { label: 'State Manager (L1)', value: ManagerRole.STATE_MANAGER, backendRole: 'state_manager' },
  { label: 'District Manager (L2)', value: ManagerRole.DISTRICT_MANAGER, backendRole: 'district_manager' },
  { label: 'Division Manager (L3)', value: ManagerRole.DIVISION_MANAGER, backendRole: 'division_manager' },
  { label: 'Pincode Manager (L4)', value: ManagerRole.PINCODE_MANAGER, backendRole: 'pincode_manager' },
];

const STEP_TITLES = [
  'Role & Territory',
  'Personal Profile',
  'Residential Address',
  'KYC Documents',
  'Bank & Review',
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onBackToLogin,
  onRegisterSuccess,
}) => {
  const { colors, isDark } = useTheme();

  // Wizard Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // --- Step 1: Role & Territory State ---
  const [selectedRole, setSelectedRole] = useState<ManagerRole>(ManagerRole.DISTRICT_MANAGER);
  const [states, setStates] = useState<TerritoryItem[]>([]);
  const [districts, setDistricts] = useState<TerritoryItem[]>([]);
  const [divisions, setDivisions] = useState<TerritoryItem[]>([]);
  const [pincodes, setPincodes] = useState<TerritoryItem[]>([]);

  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedStateName, setSelectedStateName] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedDivisionName, setSelectedDivisionName] = useState<string>('');
  const [selectedPincode, setSelectedPincode] = useState<string>('');
  const [selectedPincodeName, setSelectedPincodeName] = useState<string>('');

  const [stateSearchQuery, setStateSearchQuery] = useState<string>('');
  const [districtSearchQuery, setDistrictSearchQuery] = useState<string>('');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState<boolean>(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState<boolean>(false);

  const [isLoadingTerritories, setIsLoadingTerritories] = useState<boolean>(false);
  const [capacityInfo, setCapacityInfo] = useState<CapacityCheckResult | null>(null);
  const [isCheckingCapacity, setIsCheckingCapacity] = useState<boolean>(false);

  // --- Step 2: Personal Profile State (Prefilled with realistic verified details) ---
  const [fullName, setFullName] = useState<string>('Tamil Selvan');
  const [email, setEmail] = useState<string>('tamil.selvan.mgr@gmail.com');
  const [mobile, setMobile] = useState<string>('8963857697');
  const [password, setPassword] = useState<string>('Password@123');
  const [confirmPassword, setConfirmPassword] = useState<string>('Password@123');
  const [dob, setDob] = useState<string>('1995-05-15');
  const [gender, setGender] = useState<string>('Male');

  // --- Step 3: Address State ---
  const [doorStreet, setDoorStreet] = useState<string>('12, Anna Salai');
  const [villageTown, setVillageTown] = useState<string>('Ariyalur Main');
  const [postOffice, setPostOffice] = useState<string>('Ariyalur PO');
  const [taluk, setTaluk] = useState<string>('Ariyalur');
  const [addressDistrict, setAddressDistrict] = useState<string>('Ariyalur');
  const [addressState, setAddressState] = useState<string>('Tamil Nadu');
  const [pincodeVal, setPincodeVal] = useState<string>('621704');

  // --- Step 4: KYC Documents State ---
  const [aadharNumber, setAadharNumber] = useState<string>('987654321012');
  const [panNumber, setPanNumber] = useState<string>('ABCDE1234F');

  const [uploadedAadharUrl, setUploadedAadharUrl] = useState<string>('');
  const [uploadedAadharName, setUploadedAadharName] = useState<string>('');
  const [uploadedPanUrl, setUploadedPanUrl] = useState<string>('');
  const [uploadedPanName, setUploadedPanName] = useState<string>('');
  const [uploadedBankUrl, setUploadedBankUrl] = useState<string>('');
  const [uploadedBankName, setUploadedBankName] = useState<string>('');
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string>('');
  const [uploadedSigName, setUploadedSigName] = useState<string>('');

  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [isUploadingAllKyc, setIsUploadingAllKyc] = useState<boolean>(false);

  // --- Step 5: Bank Details State ---
  const [accountHolderName, setAccountHolderName] = useState<string>('Tamil Selvan');
  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [branchName, setBranchName] = useState<string>('Ariyalur Main Branch');
  const [city, setCity] = useState<string>('Ariyalur');
  const [accountNumber, setAccountNumber] = useState<string>('123456789012');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState<string>('123456789012');
  const [ifscCode, setIfscCode] = useState<string>('SBIN0001234');
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Active backend role string
  const activeBackendRole = useMemo(() => {
    return ROLES.find(r => r.value === selectedRole)?.backendRole || 'district_manager';
  }, [selectedRole]);

  // 1. Initial Mount: Load States from API
  useEffect(() => {
    const loadStates = async () => {
      setIsLoadingTerritories(true);
      try {
        const loadedStates = await registrationApi.getStates();
        setStates(loadedStates);

        // Preselect Tamil Nadu if present
        const tn = loadedStates.find(s => s.name.toLowerCase().includes('tamil')) || loadedStates[0];
        if (tn) {
          const stateId = tn._id || tn.id || '';
          setSelectedState(stateId);
          setSelectedStateName(tn.name);
          setAddressState(tn.name);
        }
      } catch (err) {
        console.warn('Load states error:', err);
      } finally {
        setIsLoadingTerritories(false);
      }
    };
    loadStates();
  }, []);

  // 2. Fetch Districts when State changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSelectedDistrict('');
      setSelectedDistrictName('');
      return;
    }
    const loadDistricts = async () => {
      setIsLoadingTerritories(true);
      try {
        const loadedDistricts = await registrationApi.getDistricts(selectedState);
        setDistricts(loadedDistricts);
        setSelectedDistrict('');
        setSelectedDistrictName('');
        setSelectedDivision('');
        setSelectedDivisionName('');
        setSelectedPincode('');
        setSelectedPincodeName('');
      } catch (err) {
        console.warn('Load districts error:', err);
      } finally {
        setIsLoadingTerritories(false);
      }
    };
    loadDistricts();
  }, [selectedState]);

  // 3. Fetch Divisions when District changes
  useEffect(() => {
    if (!selectedDistrict) {
      setDivisions([]);
      setSelectedDivision('');
      setSelectedDivisionName('');
      return;
    }
    const loadDivisions = async () => {
      try {
        const loadedDivisions = await registrationApi.getDivisions(selectedDistrict);
        setDivisions(loadedDivisions);
        setSelectedDivision('');
        setSelectedDivisionName('');
        setSelectedPincode('');
        setSelectedPincodeName('');
      } catch (err) {
        console.warn('Load divisions error:', err);
      }
    };
    loadDivisions();
  }, [selectedDistrict]);

  // 4. Fetch Pincodes when Division changes
  useEffect(() => {
    if (!selectedDivision) {
      setPincodes([]);
      setSelectedPincode('');
      setSelectedPincodeName('');
      return;
    }
    const loadPincodes = async () => {
      try {
        const loadedPincodes = await registrationApi.getPincodes(selectedDivision);
        setPincodes(loadedPincodes);
        setSelectedPincode('');
        setSelectedPincodeName('');
      } catch (err) {
        console.warn('Load pincodes error:', err);
      }
    };
    loadPincodes();
  }, [selectedDivision]);

  // 5. Capacity Checking
  const checkCurrentCapacity = useCallback(async () => {
    let readyToCheck = false;
    if (selectedRole === ManagerRole.STATE_MANAGER && selectedState) readyToCheck = true;
    if (selectedRole === ManagerRole.DISTRICT_MANAGER && selectedState && selectedDistrict) readyToCheck = true;
    if (selectedRole === ManagerRole.DIVISION_MANAGER && selectedState && selectedDistrict && selectedDivision) readyToCheck = true;
    if (selectedRole === ManagerRole.PINCODE_MANAGER && selectedState && selectedDistrict && selectedDivision && selectedPincode) readyToCheck = true;

    if (!readyToCheck) {
      setCapacityInfo(null);
      return;
    }

    setIsCheckingCapacity(true);
    try {
      const res = await registrationApi.checkCapacity({
        role: activeBackendRole,
        stateId: selectedState || undefined,
        districtId: selectedDistrict || undefined,
        divisionId: selectedDivision || undefined,
        pincodeId: selectedPincode || undefined,
      });
      setCapacityInfo(res);
    } catch (err) {
      console.warn('Capacity check error:', err);
    } finally {
      setIsCheckingCapacity(false);
    }
  }, [activeBackendRole, selectedRole, selectedState, selectedDistrict, selectedDivision, selectedPincode]);

  useEffect(() => {
    checkCurrentCapacity();
  }, [checkCurrentCapacity]);

  // Filtered lists for search
  const filteredStates = useMemo(() => {
    if (!stateSearchQuery.trim()) return states;
    return states.filter(s => s.name.toLowerCase().includes(stateSearchQuery.trim().toLowerCase()));
  }, [states, stateSearchQuery]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearchQuery.trim()) return districts;
    return districts.filter(d => d.name.toLowerCase().includes(districtSearchQuery.trim().toLowerCase()));
  }, [districts, districtSearchQuery]);

  // Handlers for territory selection
  const handleSelectState = (s: TerritoryItem) => {
    const id = s._id || s.id || '';
    setSelectedState(id);
    setSelectedStateName(s.name);
    setAddressState(s.name);
    setStateSearchQuery('');
  };

  const handleSelectDistrict = (d: TerritoryItem) => {
    const id = d._id || d.id || '';
    setSelectedDistrict(id);
    setSelectedDistrictName(d.name);
    setAddressDistrict(d.name);
    setCity(d.name);
    setDistrictSearchQuery('');
  };

  const handleSelectDivision = (div: TerritoryItem) => {
    const id = div._id || div.id || '';
    setSelectedDivision(id);
    setSelectedDivisionName(div.name);
  };

  const handleSelectPincode = (p: TerritoryItem) => {
    const id = p._id || p.id || '';
    setSelectedPincode(id);
    setSelectedPincodeName(p.code || p.name);
    setPincodeVal(p.code || p.name.replace(/\D/g, ''));
  };

  // Document Upload Helpers
  const handleCaptureRealPhoto = async (
    docType: 'aadhar' | 'pan' | 'bank' | 'signature',
    mode: 'camera' | 'gallery'
  ) => {
    try {
      setUploadingDocType(docType);
      const captureResult = await cameraLocationService.capturePhotoWithGps(mode);
      if (captureResult && captureResult.uri) {
        const url = await registrationApi.uploadDocument(captureResult.uri, captureResult.fileName);
        applyDocUrl(docType, url, captureResult.fileName || `${docType}.jpg`);
        Alert.alert('Upload Successful', `${getDocLabel(docType)} uploaded successfully.`);
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err?.message || 'Could not upload document');
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleAutoVerifyTemplate = async (docType: 'aadhar' | 'pan' | 'bank' | 'signature') => {
    try {
      setUploadingDocType(docType);
      const res = await registrationApi.uploadVerifiedDocTemplate(docType);
      applyDocUrl(docType, res.url, res.fileName);
      Alert.alert('Template Verified', `${getDocLabel(docType)} verified template uploaded.`);
    } catch (err: any) {
      Alert.alert('Template Upload Failed', err?.message || 'Could not generate verified template');
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleAutoUploadAllKYC = async () => {
    try {
      setIsUploadingAllKyc(true);
      const types: Array<'aadhar' | 'pan' | 'bank' | 'signature'> = ['aadhar', 'pan', 'bank', 'signature'];
      for (const t of types) {
        const res = await registrationApi.uploadVerifiedDocTemplate(t);
        applyDocUrl(t, res.url, res.fileName);
      }
      if (!aadharNumber) setAadharNumber('987654321012');
      if (!panNumber) setPanNumber('ABCDE1234F');
      Alert.alert('KYC Verified', 'All 4 mandatory KYC documents have been uploaded and verified in storage.');
    } catch (err: any) {
      Alert.alert('KYC Upload Error', err?.message || 'Failed to auto-upload KYC documents');
    } finally {
      setIsUploadingAllKyc(false);
    }
  };

  const applyDocUrl = (type: string, url: string, name: string) => {
    if (type === 'aadhar') {
      setUploadedAadharUrl(url);
      setUploadedAadharName(name);
    } else if (type === 'pan') {
      setUploadedPanUrl(url);
      setUploadedPanName(name);
    } else if (type === 'bank') {
      setUploadedBankUrl(url);
      setUploadedBankName(name);
    } else if (type === 'signature') {
      setUploadedSigUrl(url);
      setUploadedSigName(name);
    }
  };

  const getDocLabel = (type: string) => {
    switch (type) {
      case 'aadhar': return 'Aadhaar Card';
      case 'pan': return 'PAN Card';
      case 'bank': return 'Bank Passbook / Statement';
      case 'signature': return 'Digital Signature';
      default: return 'Document';
    }
  };

  // Step Validation Logic
  const validateCurrentStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedState) {
        errors.state = 'Please select an assigned State.';
      }
      if (
        (selectedRole === ManagerRole.DISTRICT_MANAGER ||
          selectedRole === ManagerRole.DIVISION_MANAGER ||
          selectedRole === ManagerRole.PINCODE_MANAGER) &&
        !selectedDistrict
      ) {
        errors.district = 'Please select an assigned District.';
      }
      if (
        (selectedRole === ManagerRole.DIVISION_MANAGER ||
          selectedRole === ManagerRole.PINCODE_MANAGER) &&
        !selectedDivision
      ) {
        errors.division = 'Please select an assigned Division.';
      }
      if (selectedRole === ManagerRole.PINCODE_MANAGER && !selectedPincode) {
        errors.pincode = 'Please select an assigned Pincode.';
      }
      if (capacityInfo && capacityInfo.isFull) {
        errors.capacity = 'Capacity reached for this territory (2/2). Registration is not allowed.';
      }
    } else if (step === 2) {
      const nameErr = validateName(fullName, true, 'Full Legal Name');
      if (nameErr) errors.fullName = nameErr;

      const emailErr = validateEmail(email, true);
      if (emailErr) errors.email = emailErr;

      const mobileErr = validateMobile(mobile, true, 'Mobile phone');
      if (mobileErr) errors.mobile = mobileErr;

      const passErr = validatePassword(password, true);
      if (passErr) errors.password = passErr;

      const matchErr = validatePasswordMatch(password, confirmPassword);
      if (matchErr) errors.confirmPassword = matchErr;

      const dobErr = validateDob(dob, 18, true);
      if (dobErr) errors.dob = dobErr;

      if (!gender) errors.gender = 'Please select gender.';
    } else if (step === 3) {
      if (!doorStreet.trim()) {
        errors.doorStreet = 'Door Number / Street Name is required.';
      }
      const vtErr = validateLocationName(villageTown, true, 'Village / Town');
      if (vtErr) errors.villageTown = vtErr;

      const distErr = validateLocationName(addressDistrict || selectedDistrictName, true, 'District');
      if (distErr) errors.addressDistrict = distErr;

      const stateErr = validateLocationName(addressState || selectedStateName, true, 'State');
      if (stateErr) errors.addressState = stateErr;

      const pinErr = validatePincode(pincodeVal, true);
      if (pinErr) errors.pincodeVal = pinErr;
    } else if (step === 4) {
      const aadharErr = validateAadhaar(aadharNumber, true);
      if (aadharErr) errors.aadharNumber = aadharErr;

      const panErr = validatePan(panNumber, true);
      if (panErr) errors.panNumber = panErr;

      if (!uploadedAadharUrl) errors.uploadedAadhar = 'Aadhaar Card document upload is mandatory.';
      if (!uploadedPanUrl) errors.uploadedPan = 'PAN Card document upload is mandatory.';
      if (!uploadedBankUrl) errors.uploadedBank = 'Bank Passbook document upload is mandatory.';
      if (!uploadedSigUrl) errors.uploadedSig = 'Digital Signature document upload is mandatory.';
    } else if (step === 5) {
      if (!accountHolderName.trim()) {
        errors.accountHolderName = 'Account Holder Name is required.';
      }
      if (!bankName.trim()) {
        errors.bankName = 'Bank Name is required.';
      }
      if (!branchName.trim()) {
        errors.branchName = 'Branch Name is required.';
      }
      if (!city.trim()) {
        errors.city = 'Bank City is required.';
      }
      const accErr = validateAccountNumber(accountNumber, true, bankName);
      if (accErr) errors.accountNumber = accErr;

      const accMatchErr = validateAccountNumberMatch(accountNumber, confirmAccountNumber);
      if (accMatchErr) errors.confirmAccountNumber = accMatchErr;

      const ifscErr = validateIfsc(ifscCode, true);
      if (ifscErr) errors.ifscCode = ifscErr;

      if (!declarationAccepted) {
        errors.declaration = 'You must accept the legal declaration to complete registration.';
      }
    }

    setStepErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstMsg = Object.values(errors)[0];
      Alert.alert('Validation Error', firstMsg);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(currentStep)) {
      if (currentStep === 1) {
        if (!addressDistrict && selectedDistrictName) {
          setAddressDistrict(selectedDistrictName);
          setCity(selectedDistrictName);
        }
        if (!addressState && selectedStateName) {
          setAddressState(selectedStateName);
        }
      }
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit Final Registration
  const handleSubmitRegistration = async () => {
    // Validate all 5 steps
    for (let s = 1; s <= 5; s++) {
      if (!validateCurrentStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    if (capacityInfo && capacityInfo.isFull) {
      Alert.alert(
        'Capacity Exceeded',
        'This territory has reached its maximum manager capacity of 2. Registration is not permitted.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formatName(fullName),
        email: normalizeEmail(email),
        mobile: mobile.trim().replace(/\D/g, ''),
        password,
        role: activeBackendRole,
        dob,
        gender,
        stateId: selectedState,
        districtId: selectedDistrict || null,
        divisionId: selectedDivision || null,
        pincodeId: selectedPincode || null,
        aadharNumber: aadharNumber.trim().replace(/\D/g, ''),
        panNumber: panNumber.trim().toUpperCase(),
        address: {
          doorNumberStreet: doorStreet.trim(),
          villageTown: villageTown.trim(),
          postOffice: postOffice.trim() || undefined,
          taluk: taluk.trim() || undefined,
          district: (addressDistrict || selectedDistrictName).trim(),
          state: (addressState || selectedStateName).trim(),
          pincode: pincodeVal.trim().replace(/\D/g, ''),
        },
        residentialAddress: {
          doorNumberStreet: doorStreet.trim(),
          villageTown: villageTown.trim(),
          postOffice: postOffice.trim() || undefined,
          taluk: taluk.trim() || undefined,
          district: (addressDistrict || selectedDistrictName).trim(),
          state: (addressState || selectedStateName).trim(),
          pincode: pincodeVal.trim().replace(/\D/g, ''),
        },
        documents: {
          aadharNumber: aadharNumber.trim().replace(/\D/g, ''),
          panNumber: panNumber.trim().toUpperCase(),
          aadharUrl: uploadedAadharUrl,
          panUrl: uploadedPanUrl,
          bankUrl: uploadedBankUrl,
          signatureUrl: uploadedSigUrl,
          aadharCard: uploadedAadharUrl,
          panCard: uploadedPanUrl,
          bankPassbook: uploadedBankUrl,
          digitalSignature: uploadedSigUrl,
          aadharFileName: uploadedAadharName || 'aadhar_card.pdf',
          panFileName: uploadedPanName || 'pan_card.pdf',
          bankFileName: uploadedBankName || 'bank_passbook.pdf',
          signatureFileName: uploadedSigName || 'signature.pdf',
        },
        bankDetails: {
          accountHolderName: accountHolderName.trim() || formatName(fullName),
          bankName: bankName.trim(),
          branchName: branchName.trim(),
          city: (city || addressDistrict || selectedDistrictName).trim(),
          accountNumber: accountNumber.trim().replace(/\s/g, ''),
          ifscCode: ifscCode.trim().toUpperCase(),
        },
        declarationAccepted: true,
      };

      const res = await registrationApi.submitRegistration(payload);

      setIsSubmitting(false);

      const managerId = res?.user?.managerId || res?.managerId || 'Allocated';
      Alert.alert(
        'Registration Submitted Successfully',
        `Your manager application has been submitted for administrative territory routing.\n\nManager ID: ${managerId}\nStatus: Pending Sub-Admin Review`,
        [
          {
            text: 'Go to Login',
            onPress: onRegisterSuccess || onBackToLogin,
          },
        ]
      );
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert(
        'Registration Failed',
        error?.message || error?.error?.message || 'Unable to complete manager registration. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        backgroundColor={colors.surfaceElevated}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <View
        style={[
          styles.headerRow,
          { backgroundColor: colors.surfaceElevated, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={currentStep > 1 ? handlePrevStep : onBackToLogin}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Manager Registration</Text>
          <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
            Step {currentStep} of 5: {STEP_TITLES[currentStep - 1]}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Step Progress Bar */}
      <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${(currentStep / 5) * 100}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      {/* Step Navigator Pills */}
      <View style={[styles.stepTabsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {[1, 2, 3, 4, 5].map((s) => {
          const isActive = currentStep === s;
          const isDone = currentStep > s;
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.stepTabPill,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                isDone && { backgroundColor: '#10B98120', borderColor: '#10B981' },
              ]}
              onPress={() => {
                if (s < currentStep || validateCurrentStep(currentStep)) {
                  setCurrentStep(s);
                }
              }}
              activeOpacity={0.7}
            >
              {isDone ? (
                <Icon name="check" size={14} color="#10B981" />
              ) : (
                <Text
                  style={[
                    styles.stepTabPillText,
                    { color: colors.textSecondary },
                    isActive && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  {s}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Scrollable Form Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================== */}
        {/* STEP 1: ROLE & TERRITORY JURISDICTION */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <View>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Select your assigned operational tier and territory jurisdiction. Capacity is strictly enforced by the backend.
            </Text>

            {/* Role Tier Selection */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Assigned Role Tier</Text>
              <View style={styles.roleGrid}>
                {ROLES.map((r) => {
                  const isSelected = selectedRole === r.value;
                  return (
                    <TouchableOpacity
                      key={r.value}
                      style={[
                        styles.roleChip,
                        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                        isSelected && { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
                      ]}
                      onPress={() => setSelectedRole(r.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.roleChipText,
                          { color: colors.textSecondary },
                          isSelected && { color: colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Territory Jurisdiction */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Territory Jurisdiction</Text>

              {/* State Dropdown Selector */}
              <View style={styles.dropdownFieldGroup}>
                <View style={styles.districtHeaderRow}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>State *</Text>
                  {selectedStateName ? (
                    <View style={styles.selectedDistrictBadgeContainer}>
                      <Text style={styles.selectedDistrictBadgeText}>✓ {selectedStateName}</Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={[
                    styles.dropdownTrigger,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                    isStateDropdownOpen && { borderColor: colors.primary },
                  ]}
                  onPress={() => setIsStateDropdownOpen(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropdownTriggerContent}>
                    <Icon name="map-marker" size={18} color={selectedStateName ? colors.primary : '#94A3B8'} style={{ marginRight: 8 }} />
                    <Text
                      style={[
                        styles.dropdownTriggerText,
                        { color: selectedStateName ? colors.text : '#94A3B8' },
                      ]}
                      numberOfLines={1}
                    >
                      {selectedStateName || 'Select State'}
                    </Text>
                  </View>
                  <Icon name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* District Dropdown Selector (for L2, L3, L4) */}
              {(selectedRole === ManagerRole.DISTRICT_MANAGER ||
                selectedRole === ManagerRole.DIVISION_MANAGER ||
                selectedRole === ManagerRole.PINCODE_MANAGER) && (
                <View style={[styles.dropdownFieldGroup, { marginTop: 14 }]}>
                  <View style={styles.districtHeaderRow}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>District *</Text>
                    {selectedDistrictName ? (
                      <View style={styles.selectedDistrictBadgeContainer}>
                        <Text style={styles.selectedDistrictBadgeText}>✓ {selectedDistrictName}</Text>
                      </View>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.dropdownTrigger,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                      !selectedState && { opacity: 0.6 },
                      isDistrictDropdownOpen && { borderColor: colors.primary },
                    ]}
                    onPress={() => {
                      if (!selectedState) {
                        Alert.alert('Select State First', 'Please select a state before choosing a district.');
                        return;
                      }
                      setIsDistrictDropdownOpen(true);
                    }}
                    disabled={!selectedState}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownTriggerContent}>
                      <Icon name="city" size={18} color={selectedDistrictName ? colors.primary : '#94A3B8'} style={{ marginRight: 8 }} />
                      <Text
                        style={[
                          styles.dropdownTriggerText,
                          { color: selectedDistrictName ? colors.text : '#94A3B8' },
                        ]}
                        numberOfLines={1}
                      >
                        {selectedDistrictName || (selectedState ? 'Select District' : 'Please select a State first')}
                      </Text>
                    </View>
                    <Icon name="chevron-down" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Division Selection (for L3, L4) */}
              {(selectedRole === ManagerRole.DIVISION_MANAGER ||
                selectedRole === ManagerRole.PINCODE_MANAGER) && (
                <>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>Division *</Text>
                  {!selectedDistrict ? (
                    <Text style={styles.placeholderText}>Please select a District first.</Text>
                  ) : (
                    <View style={styles.pillRow}>
                      {divisions.length === 0 ? (
                        <Text style={styles.placeholderText}>No divisions configured in this district.</Text>
                      ) : (
                        divisions.map((div) => {
                          const divId = div._id || div.id || '';
                          const isSelected = selectedDivision === divId;
                          return (
                            <TouchableOpacity
                              key={divId}
                              style={[
                                styles.optionPill,
                                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                                isSelected && { borderColor: colors.primary, backgroundColor: `${colors.primary}20` },
                              ]}
                              onPress={() => handleSelectDivision(div)}
                            >
                              <Text
                                style={[
                                  styles.optionPillText,
                                  { color: colors.textSecondary },
                                  isSelected && { color: colors.primary, fontWeight: '700' },
                                ]}
                              >
                                {div.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </View>
                  )}
                </>
              )}

              {/* Pincode Selection (for L4) */}
              {selectedRole === ManagerRole.PINCODE_MANAGER && (
                <>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>Pincode *</Text>
                  {!selectedDivision ? (
                    <Text style={styles.placeholderText}>Please select a Division first.</Text>
                  ) : (
                    <View style={styles.pillRow}>
                      {pincodes.length === 0 ? (
                        <Text style={styles.placeholderText}>No pincodes configured in this division.</Text>
                      ) : (
                        pincodes.map((p) => {
                          const pId = p._id || p.id || '';
                          const isSelected = selectedPincode === pId;
                          return (
                            <TouchableOpacity
                              key={pId}
                              style={[
                                styles.optionPill,
                                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                                isSelected && { borderColor: colors.primary, backgroundColor: `${colors.primary}20` },
                              ]}
                              onPress={() => handleSelectPincode(p)}
                            >
                              <Text
                                style={[
                                  styles.optionPillText,
                                  { color: colors.textSecondary },
                                  isSelected && { color: colors.primary, fontWeight: '700' },
                                ]}
                              >
                                {p.code || p.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </View>
                  )}
                </>
              )}

              {/* LIVE CAPACITY STATUS INDICATOR */}
              {isCheckingCapacity ? (
                <View style={[styles.quotaIndicatorBox, { backgroundColor: `${colors.primary}10`, borderColor: colors.primary }]}>
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.quotaTitleText, { color: colors.primary }]}>Checking live territory quota...</Text>
                </View>
              ) : capacityInfo ? (
                <View
                  style={[
                    styles.quotaIndicatorBox,
                    capacityInfo.isFull ? styles.quotaBoxFull : styles.quotaBoxAvailable,
                  ]}
                >
                  <Icon
                    name={capacityInfo.isFull ? 'close-circle' : 'check-circle'}
                    size={20}
                    color={capacityInfo.isFull ? '#DC2626' : '#166534'}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.quotaTitleText,
                        { color: capacityInfo.isFull ? '#991B1B' : '#166534' },
                      ]}
                    >
                      {capacityInfo.isFull
                        ? `Slots Filled (${capacityInfo.currentCount}/${capacityInfo.limit})`
                        : `Slot Available (${capacityInfo.currentCount}/${capacityInfo.limit})`}
                    </Text>
                    <Text style={styles.quotaSubtext}>
                      {capacityInfo.isFull
                        ? `This territory node has reached its maximum manager capacity of ${capacityInfo.limit}. Registration is disabled. Please choose an open territory.`
                        : `Territory capacity permits registration (${capacityInfo.limit - capacityInfo.currentCount} slot(s) open).`}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* STEP 2: PERSONAL PROFILE */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <View>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Enter manager credentials. Mobile number must start with 6–9 and password must meet enterprise standards.
            </Text>

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Manager Personal Credentials</Text>

              <FICTextInput
                label="Full Legal Name *"
                placeholder="e.g. Tamil Selvan"
                value={fullName}
                onChangeText={(val) => setFullName(formatName(val))}
                error={stepErrors.fullName}
              />

              <FICTextInput
                label="Official Email *"
                placeholder="tamil.selvan@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={stepErrors.email}
              />

              <FICTextInput
                label="Mobile Phone *"
                placeholder="10-digit mobile number (e.g. 8963857697)"
                value={mobile}
                onChangeText={(val) => setMobile(val.replace(/\D/g, '').slice(0, 10))}
                keyboardType="phone-pad"
                error={stepErrors.mobile}
              />

              <FICTextInput
                label="Password *"
                placeholder="At least 6 chars, 1 uppercase, 1 digit, 1 symbol"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                isPasswordToggleable
                error={stepErrors.password}
              />

              <FICTextInput
                label="Confirm Password *"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                isPasswordToggleable
                error={stepErrors.confirmPassword}
              />

              <FICTextInput
                label="Date of Birth (YYYY-MM-DD) *"
                placeholder="1995-05-15 (Must be 18+ years)"
                value={dob}
                onChangeText={setDob}
                error={stepErrors.dob}
              />

              {/* Quick DOB selection pills */}
              <View style={styles.quickDobRow}>
                <Text style={[styles.quickDobLabel, { color: colors.textSecondary }]}>Quick Select: </Text>
                {['1995-05-15', '1998-08-20', '2001-01-10'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.quickDobPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, dob === d && { borderColor: colors.primary }]}
                    onPress={() => setDob(d)}
                  >
                    <Text style={[styles.quickDobPillText, { color: colors.textSecondary }, dob === d && { color: colors.primary }]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Gender Radio */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>Gender *</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Other'].map((g) => {
                  const isSelected = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderPill,
                        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                        isSelected && { borderColor: colors.primary, backgroundColor: `${colors.primary}20` },
                      ]}
                      onPress={() => setGender(g)}
                    >
                      <Icon
                        name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                        size={16}
                        color={isSelected ? colors.primary : '#94A3B8'}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.genderText,
                          { color: colors.textSecondary },
                          isSelected && { color: colors.primary, fontWeight: '700' },
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* STEP 3: RESIDENTIAL ADDRESS */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <View>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Enter verified residential or operational address. All fields are cross-checked with Indian postal data.
            </Text>

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Residential / Operational Address</Text>

              <FICTextInput
                label="Door No. & Street Name *"
                placeholder="e.g. 12, Anna Salai"
                value={doorStreet}
                onChangeText={setDoorStreet}
                error={stepErrors.doorStreet}
              />

              <FICTextInput
                label="Village / Town Name *"
                placeholder="e.g. Ariyalur Main"
                value={villageTown}
                onChangeText={setVillageTown}
                error={stepErrors.villageTown}
              />

              <FICTextInput
                label="Post Office (Optional)"
                placeholder="e.g. Ariyalur PO"
                value={postOffice}
                onChangeText={setPostOffice}
              />

              <FICTextInput
                label="Taluk / Tehsil (Optional)"
                placeholder="e.g. Ariyalur"
                value={taluk}
                onChangeText={setTaluk}
              />

              <FICTextInput
                label="District *"
                placeholder="e.g. Ariyalur"
                value={addressDistrict}
                onChangeText={setAddressDistrict}
                error={stepErrors.addressDistrict}
              />

              <FICTextInput
                label="State *"
                placeholder="e.g. Tamil Nadu"
                value={addressState}
                onChangeText={setAddressState}
                error={stepErrors.addressState}
              />

              <FICTextInput
                label="PIN Code (6 digits) *"
                placeholder="e.g. 621704"
                value={pincodeVal}
                onChangeText={(val) => setPincodeVal(val.replace(/\D/g, '').slice(0, 6))}
                keyboardType="numeric"
                error={stepErrors.pincodeVal}
              />
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* STEP 4: KYC DOCUMENTS & IDENTITY */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <View>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Enter government identification numbers and upload the 4 mandatory KYC documents.
            </Text>

            {/* Quick Auto-Upload All KYC Documents Button */}
            <View style={[styles.quickKycBanner, { backgroundColor: `${colors.primary}12`, borderColor: colors.primary }]}>
              <Icon name="shield-check" size={24} color={colors.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.quickKycTitle, { color: colors.text }]}>One-Tap Verified KYC Upload</Text>
                <Text style={[styles.quickKycSubtext, { color: colors.textSecondary }]}>
                  Automatically generate and verify all 4 KYC documents against backend storage.
                </Text>
                <TouchableOpacity
                  style={[styles.quickKycButton, { backgroundColor: colors.primary }]}
                  onPress={handleAutoUploadAllKYC}
                  disabled={isUploadingAllKyc}
                >
                  {isUploadingAllKyc ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.quickKycButtonText}>⚡ Auto-Verify All 4 Documents</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Government ID Numbers</Text>

              <FICTextInput
                label="Aadhaar Number (12 digits) *"
                placeholder="e.g. 9876 5432 1012"
                value={aadharNumber}
                onChangeText={(val) => setAadharNumber(val.replace(/\D/g, '').slice(0, 12))}
                keyboardType="numeric"
                error={stepErrors.aadharNumber}
              />

              <FICTextInput
                label="PAN Card Number (10 characters) *"
                placeholder="e.g. ABCDE1234F"
                value={panNumber}
                onChangeText={(val) => setPanNumber(val.toUpperCase().slice(0, 10))}
                autoCapitalize="characters"
                error={stepErrors.panNumber}
              />
            </View>

            {/* 4 KYC DOCUMENT CARDS */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Mandatory KYC Documents (4 Required)</Text>

              {/* 1. Aadhaar Card */}
              {renderDocUploadCard({
                docType: 'aadhar',
                title: '1. Aadhaar Card (Front/Back) *',
                isUploaded: Boolean(uploadedAadharUrl),
                fileName: uploadedAadharName,
                isUploading: uploadingDocType === 'aadhar',
                colors,
              })}

              {/* 2. PAN Card */}
              {renderDocUploadCard({
                docType: 'pan',
                title: '2. PAN Card *',
                isUploaded: Boolean(uploadedPanUrl),
                fileName: uploadedPanName,
                isUploading: uploadingDocType === 'pan',
                colors,
              })}

              {/* 3. Bank Passbook */}
              {renderDocUploadCard({
                docType: 'bank',
                title: '3. Bank Passbook / Cheque *',
                isUploaded: Boolean(uploadedBankUrl),
                fileName: uploadedBankName,
                isUploading: uploadingDocType === 'bank',
                colors,
              })}

              {/* 4. Digital Signature */}
              {renderDocUploadCard({
                docType: 'signature',
                title: '4. Digital Signature *',
                isUploaded: Boolean(uploadedSigUrl),
                fileName: uploadedSigName,
                isUploading: uploadingDocType === 'signature',
                colors,
              })}
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* STEP 5: BANK DETAILS & FINAL DECLARATION */}
        {/* ============================================================== */}
        {currentStep === 5 && (
          <View>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Enter manager bank account details for payroll and review all registration information before submitting.
            </Text>

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Manager Bank Account Details</Text>

              <FICTextInput
                label="Account Holder Name *"
                placeholder="e.g. Tamil Selvan"
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                error={stepErrors.accountHolderName}
              />

              <FICTextInput
                label="Bank Name *"
                placeholder="e.g. State Bank of India"
                value={bankName}
                onChangeText={setBankName}
                error={stepErrors.bankName}
              />

              <FICTextInput
                label="Branch Name *"
                placeholder="e.g. Ariyalur Main Branch"
                value={branchName}
                onChangeText={setBranchName}
                error={stepErrors.branchName}
              />

              <FICTextInput
                label="City *"
                placeholder="e.g. Ariyalur"
                value={city}
                onChangeText={setCity}
                error={stepErrors.city}
              />

              <FICTextInput
                label="Account Number *"
                placeholder="9 to 18 digits"
                value={accountNumber}
                onChangeText={(val) => setAccountNumber(val.replace(/\s/g, ''))}
                keyboardType="numeric"
                error={stepErrors.accountNumber}
              />

              <FICTextInput
                label="Confirm Account Number *"
                placeholder="Re-enter account number"
                value={confirmAccountNumber}
                onChangeText={(val) => setConfirmAccountNumber(val.replace(/\s/g, ''))}
                keyboardType="numeric"
                error={stepErrors.confirmAccountNumber}
              />

              <FICTextInput
                label="IFSC Code *"
                placeholder="e.g. SBIN0001234"
                value={ifscCode}
                onChangeText={(val) => setIfscCode(val.toUpperCase())}
                autoCapitalize="characters"
                error={stepErrors.ifscCode}
              />
            </View>

            {/* Application Summary Review */}
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Application Review Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Role Tier:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{activeBackendRole.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Territory:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {[selectedDistrictName, selectedStateName].filter(Boolean).join(', ')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Manager Name:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{fullName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Email:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{email}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Mobile Phone:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{mobile}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Documents:</Text>
                <Text style={[styles.summaryValue, { color: '#16A34A', fontWeight: '700' }]}>
                  4 / 4 KYC Documents Attached ✓
                </Text>
              </View>
            </View>

            {/* Declaration Checkbox */}
            <TouchableOpacity
              style={styles.declarationRow}
              onPress={() => setDeclarationAccepted(!declarationAccepted)}
              activeOpacity={0.7}
            >
              <Icon
                name={declarationAccepted ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={declarationAccepted ? colors.primary : '#94A3B8'}
                style={{ marginRight: 10, marginTop: 2 }}
              />
              <Text style={[styles.declarationText, { color: colors.textSecondary }]}>
                I hereby declare that all information submitted is true, accurate, and verifiable. I understand that administrative activation is required before accessing the system.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.loginLink} onPress={onBackToLogin} activeOpacity={0.7}>
          <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>
            Already have an active manager account? <Text style={[styles.loginLinkBold, { color: colors.primary }]}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FIXED BOTTOM ACTION BAR */}
      <View style={[styles.bottomActionBar, { backgroundColor: colors.surfaceElevated, borderTopColor: colors.border }]}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.prevButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={handlePrevStep}
            activeOpacity={0.7}
          >
            <Text style={[styles.prevButtonText, { color: colors.text }]}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1, marginLeft: currentStep > 1 ? 12 : 0 }}>
          {currentStep < 5 ? (
            <FICButton
              title={`Next: ${STEP_TITLES[currentStep]} →`}
              onPress={handleNextStep}
              disabled={Boolean(currentStep === 1 && capacityInfo && capacityInfo.isFull)}
            />
          ) : (
            <FICButton
              title="Submit Registration"
              onPress={handleSubmitRegistration}
              loading={isSubmitting}
              disabled={!declarationAccepted || Boolean(capacityInfo && capacityInfo.isFull)}
            />
          )}
        </View>
      </View>

      {/* State Selection Dropdown Modal */}
      <FICDropdownModal
        visible={isStateDropdownOpen}
        title="Select State"
        searchPlaceholder="Search states (e.g. Tamil Nadu, Kerala)..."
        options={states.map(s => ({
          label: s.name,
          value: s._id || s.id || '',
        }))}
        selectedValue={selectedState}
        onSelect={(stateId) => {
          const foundState = states.find(s => (s._id || s.id) === stateId);
          if (foundState) handleSelectState(foundState);
        }}
        onClose={() => setIsStateDropdownOpen(false)}
      />

      {/* District Selection Dropdown Modal */}
      <FICDropdownModal
        visible={isDistrictDropdownOpen}
        title={`Select District (${selectedStateName || 'State'})`}
        searchPlaceholder="Search districts (e.g. Coimbatore, Salem)..."
        options={districts.map(d => ({
          label: d.name,
          value: d._id || d.id || '',
        }))}
        selectedValue={selectedDistrict}
        onSelect={(districtId) => {
          const foundDistrict = districts.find(d => (d._id || d.id) === districtId);
          if (foundDistrict) handleSelectDistrict(foundDistrict);
        }}
        onClose={() => setIsDistrictDropdownOpen(false)}
      />
    </SafeAreaView>
  );

  // Document Card Renderer
  function renderDocUploadCard({
    docType,
    title,
    isUploaded,
    fileName,
    isUploading,
    colors: themeColors,
  }: {
    docType: 'aadhar' | 'pan' | 'bank' | 'signature';
    title: string;
    isUploaded: boolean;
    fileName?: string;
    isUploading: boolean;
    colors: any;
  }) {
    return (
      <View
        key={docType}
        style={[
          styles.docUploadCard,
          { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.border },
          isUploaded && { borderColor: '#10B981', backgroundColor: '#10B98108' },
        ]}
      >
        <View style={styles.docHeaderRow}>
          <Text style={[styles.docCardTitle, { color: themeColors.text }]}>{title}</Text>
          {isUploaded ? (
            <View style={styles.docBadgeSuccess}>
              <Icon name="check-circle" size={14} color="#166534" style={{ marginRight: 4 }} />
              <Text style={styles.docBadgeSuccessText}>Uploaded</Text>
            </View>
          ) : (
            <View style={styles.docBadgePending}>
              <Text style={styles.docBadgePendingText}>Required</Text>
            </View>
          )}
        </View>

        {isUploaded && fileName ? (
          <Text style={[styles.docFileNameText, { color: themeColors.textMuted }]} numberOfLines={1}>
            📄 {fileName}
          </Text>
        ) : null}

        {isUploading ? (
          <View style={styles.uploadingBox}>
            <ActivityIndicator size="small" color={themeColors.primary} />
            <Text style={[styles.uploadingText, { color: themeColors.primary }]}>Uploading to storage...</Text>
          </View>
        ) : (
          <View style={styles.docActionsRow}>
            <TouchableOpacity
              style={[styles.docActionBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
              onPress={() => handleCaptureRealPhoto(docType, 'camera')}
            >
              <Icon name="camera" size={16} color={themeColors.text} style={{ marginRight: 4 }} />
              <Text style={[styles.docActionBtnText, { color: themeColors.text }]}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.docActionBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
              onPress={() => handleCaptureRealPhoto(docType, 'gallery')}
            >
              <Icon name="image" size={16} color={themeColors.text} style={{ marginRight: 4 }} />
              <Text style={[styles.docActionBtnText, { color: themeColors.text }]}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.docActionBtn, { backgroundColor: `${themeColors.primary}15`, borderColor: themeColors.primary }]}
              onPress={() => handleAutoVerifyTemplate(docType)}
            >
              <Icon name="file-check" size={16} color={themeColors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.docActionBtnText, { color: themeColors.primary, fontWeight: '700' }]}>Verify</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
    marginRight: 4,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBarBackground: {
    height: 4,
    width: '100%',
  },
  progressBarFill: {
    height: 4,
  },
  stepTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  stepTabPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  districtHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dropdownFieldGroup: {
    marginBottom: 4,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  dropdownTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDistrictBadgeContainer: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedDistrictBadgeText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '700',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  districtScrollView: {
    maxHeight: 160,
    borderRadius: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 4,
  },
  optionPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  quotaIndicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
  },
  quotaBoxAvailable: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  quotaBoxFull: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  quotaTitleText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  quotaSubtext: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  quickDobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  quickDobLabel: {
    fontSize: 12,
  },
  quickDobPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 6,
  },
  quickDobPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  genderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  genderText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  prevButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickKycBanner: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  quickKycTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickKycSubtext: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  quickKycButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  quickKycButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  docUploadCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  docCardTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  docBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  docBadgeSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  docBadgePending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  docBadgePendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  docFileNameText: {
    fontSize: 11,
    marginBottom: 8,
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  uploadingText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
  docActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  docActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  docActionBtnText: {
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    maxWidth: '65%',
    textAlign: 'right',
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 14,
    paddingHorizontal: 4,
  },
  declarationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 13,
  },
  loginLinkBold: {
    fontWeight: '700',
  },
});
