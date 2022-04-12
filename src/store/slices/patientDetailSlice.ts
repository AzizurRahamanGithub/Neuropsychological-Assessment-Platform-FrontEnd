import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const API_BASE = 'http://10.0.30.73:8000/api/v1';

export type LinkType = 'all_self' | 'single_other';

export type PatientStats = {
  assignments_count: number;
  assignments_completed: number;
  by_type: {
    all_self: number;
    single_other: number;
  };
};

export type Submission = {
  link_id: number;
  assignment_id: number;
  link_type: LinkType;
  token: string;

  // ✅ API returns null sometimes
  url: string | null;

  questionnaires: string[];
  report_by: string | null;
  is_submitted: boolean;
  submitted_at: string | null;
  created_at: string;

  // ✅ API returns null when not submitted
  results: Record<string, Record<string, any>> | null;
};

export type AssignmentGroup = {
  assignment_id: number;
  is_completed: boolean;
  created_at: string;

  counts?: {
    total: number;
    submitted: number;
    pending: number;
  };

  links: Submission[];
};

export type PatientDetail = {
  id: number;
  name: string | null;
  surname: string | null;
  sex: string | null;
  birth: string | null;
  education: number | null;
  handedness: string | null;
  updated_at: string;
  created_at: string;

  // ✅ make optional because sometimes not present in response
  stats?: PatientStats;

  assignments: AssignmentGroup[];
};

type ApiResponse = {
  success: boolean;
  status_code: number;
  message: string;
  data: PatientDetail;
};

type PatientDetailState = {
  data: PatientDetail | null;
  isLoading: boolean;
  error: string | null;
  lastLoadedId: number | null;
};

const initialState: PatientDetailState = {
  data: null,
  isLoading: false,
  error: null,
  lastLoadedId: null,
};

export const fetchPatientDetail = createAsyncThunk<
  PatientDetail,
  number,
  { rejectValue: string }
>('patientDetail/fetchPatientDetail', async (patientId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return rejectWithValue('Authentication required');

    const url = `${API_BASE}/patients/patient/${patientId}/`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const json: ApiResponse = await res.json().catch(() => ({} as any));

    if (!res.ok || json?.success === false) {
      return rejectWithValue(json?.message || 'Failed to load patient detail');
    }

    return json.data;
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to load patient detail');
  }
});

const patientDetailSlice = createSlice({
  name: 'patientDetail',
  initialState,
  reducers: {
    clearPatientDetail(state) {
      state.data = null;
      state.isLoading = false;
      state.error = null;
      state.lastLoadedId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientDetail.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.lastLoadedId = action.meta.arg;
      })
      .addCase(fetchPatientDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPatientDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load patient detail';
      });
  },
});

export const { clearPatientDetail } = patientDetailSlice.actions;
export default patientDetailSlice.reducer;
