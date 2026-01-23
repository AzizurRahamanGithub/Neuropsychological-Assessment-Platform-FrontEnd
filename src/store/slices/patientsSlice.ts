import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Patient } from '@/types';

const API_BASE = 'http://10.0.30.73:8000/api/v1';
const PATIENTS_LIST_URL = `${API_BASE}/patients/list/`;

type Sex = 'M' | 'F' | 'O';

type ApiPatient = {
  id: number;
  name: string;
  surname: string;
  sex: string;
  birth: string;
  education: number;
  handedness: string;
  created_at: string;
  updated_at: string;
};

type ApiListResponse = {
  success: boolean;
  status_code: number;
  message: string;
  data: ApiPatient[];
};

const apiSexToUiSex = (sex: string): Sex => {
  const s = (sex || '').toLowerCase();
  if (s === 'male' || s === 'm') return 'M';
  if (s === 'female' || s === 'f') return 'F';
  return 'O';
};

const mapApiPatientToUi = (p: ApiPatient): Patient => ({
  id: p.id,
  name: p.name,
  surname: p.surname,
  sex: apiSexToUiSex(p.sex) as any,
  dateOfBirth: p.birth,
  yearsOfEducation: p.education,
  handedness: (p.handedness || '').toLowerCase() as any,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

type PatientsState = {
  list: Patient[];
  isLoading: boolean;
  error: string | null;
  selectedPatientId: string; // dropdown এর জন্য string
};

const initialState: PatientsState = {
  list: [],
  isLoading: false,
  error: null,
  selectedPatientId: '',
};

// ✅ thunk: patients load
export const fetchPatients = createAsyncThunk<
  Patient[],
  void,
  { rejectValue: string }
>('patients/fetchPatients', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return rejectWithValue('Authentication required');

    const res = await fetch(PATIENTS_LIST_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // যদি Token auth হয়: `Token ${token}`
      },
      cache: 'no-store',
    });

    const json: ApiListResponse = await res.json().catch(() => ({} as any));

    if (!res.ok || !json?.success) {
      return rejectWithValue(json?.message || 'Failed to load patients');
    }

    return (json.data || []).map(mapApiPatientToUi);
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to load patients');
  }
});

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setSelectedPatientId(state, action: PayloadAction<string>) {
      state.selectedPatientId = action.payload;
    },
    clearPatients(state) {
      state.list = [];
      state.selectedPatientId = '';
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load patients';
      });
  },
});

export const { setSelectedPatientId, clearPatients } = patientsSlice.actions;
export default patientsSlice.reducer;
