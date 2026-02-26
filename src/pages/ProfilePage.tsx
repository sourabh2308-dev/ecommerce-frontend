import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Lock, CheckCircle, Shield, Building2 } from 'lucide-react'
import * as usersApi from '@/api/users'
import { useAuthStore } from '@/store/authStore'
import { StatusBadge } from '@/components/StatusBadge'
import { Spinner } from '@/components/Spinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { Modal } from '@/components/Modal'
import toast from 'react-hot-toast'
import { BANK_OPTIONS, INDIAN_STATES_AND_UTS } from '@/constants/formOptions'

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required').max(50),
  lastName: z.string().min(1, 'Required').max(50),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Must be 10 digits').or(z.literal('')).optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter')
    .regex(/[0-9]/, 'One number')
    .regex(/[^a-zA-Z0-9]/, 'One special character'),
  confirmNewPassword: z.string().min(1, 'Required'),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
})
type PasswordForm = z.infer<typeof passwordSchema>

const sellerDetailSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(1, 'Required'),
  gstNumber: z.string().regex(/^[0-9A-Z]{15}$/, 'GST must be 15 alphanumeric characters').optional().or(z.literal('')),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in valid format').optional().or(z.literal('')),
  addressLine1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().regex(/^[A-Za-z .'-]{2,100}$/, 'Invalid city name'),
  state: z.enum(INDIAN_STATES_AND_UTS, { message: 'Please select a valid state/UT' }),
  pincode: z.string().regex(/^\d{6}$/, 'Must be 6 digits'),
  idType: z.string().min(1, 'Required'),
  idNumber: z.string().min(4, 'ID number is too short'),
  bankAccountNumber: z.string().regex(/^\d{9,18}$/, 'Account number must be 9-18 digits'),
  bankIfscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format'),
  bankName: z.enum(BANK_OPTIONS, { message: 'Please select a bank' }),
})
type SellerDetailForm = z.infer<typeof sellerDetailSchema>

export function ProfilePage() {
  const qc = useQueryClient()
  const { role } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [pwModal, setPwModal] = useState(false)

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
  })

  const sellerForm = useForm<SellerDetailForm>({
    resolver: zodResolver(sellerDetailSchema),
  })

  const sellerDetailMut = useMutation({
    mutationFn: usersApi.submitSellerDetails,
    onSuccess: () => {
      toast.success('Seller details submitted for review!')
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to submit seller details')
    },
  })

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const pwForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const updateMut = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      toast.success('Profile updated')
      setEditing(false)
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to update profile')
    },
  })

  const pwMut = useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed')
      setPwModal(false)
      pwForm.reset()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to change password')
    },
  })

  const startEditing = () => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber ?? '',
      })
    }
    setEditing(true)
  }

  if (isLoading) return <Spinner message="Loading profile…" />
  if (error || !user) return <ErrorMessage message="Failed to load profile" />

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="card p-6">
        {/* Avatar & role badge */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={user.role} />
              <StatusBadge status={user.status} />
              {user.emailVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile details or edit form */}
        {!editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">First Name</label>
                <p className="text-gray-900 font-medium mt-0.5">{user.firstName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Last Name</label>
                <p className="text-gray-900 font-medium mt-0.5">{user.lastName}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
              <p className="text-gray-900 font-medium mt-0.5">{user.email}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</label>
              <p className="text-gray-900 font-medium mt-0.5">{user.phoneNumber || '—'}</p>
            </div>
            {role === 'SELLER' && (
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Seller Approved</label>
                <p className="mt-0.5">
                  {user.approved ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium"><Shield className="w-4 h-4" /> Yes</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">Pending</span>
                  )}
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t">
              <button onClick={startEditing} className="btn-primary text-sm py-2 px-4">
                <Pencil className="w-4 h-4" /> Edit Profile
              </button>
              <button onClick={() => { pwForm.reset(); setPwModal(true) }} className="btn-outline text-sm py-2 px-4">
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={profileForm.handleSubmit((d) => updateMut.mutate({
            firstName: d.firstName,
            lastName: d.lastName,
            phoneNumber: d.phoneNumber || undefined,
          }))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input {...profileForm.register('firstName')} className="input" />
                {profileForm.formState.errors.firstName && <p className="error-msg">{profileForm.formState.errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...profileForm.register('lastName')} className="input" />
                {profileForm.formState.errors.lastName && <p className="error-msg">{profileForm.formState.errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input {...profileForm.register('phoneNumber')} className="input" placeholder="10-digit phone number" />
              {profileForm.formState.errors.phoneNumber && <p className="error-msg">{profileForm.formState.errors.phoneNumber.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={updateMut.isPending} className="btn-primary text-sm py-2 px-4">
                {updateMut.isPending ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline text-sm py-2 px-4">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Seller Details Form — shown for sellers in PENDING_DETAILS status */}
      {role === 'SELLER' && user.status === 'PENDING_DETAILS' && (
        <div className="card p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-gray-900">Complete Seller Verification</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">Submit your business and identity details for admin approval before you can start selling.</p>
          <form onSubmit={sellerForm.handleSubmit((d) => sellerDetailMut.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Business Name *</label>
                <input {...sellerForm.register('businessName')} className="input" />
                {sellerForm.formState.errors.businessName && <p className="error-msg">{sellerForm.formState.errors.businessName.message}</p>}
              </div>
              <div>
                <label className="label">Business Type *</label>
                <select {...sellerForm.register('businessType')} className="input">
                  <option value="">Select…</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="PARTNERSHIP">Partnership</option>
                  <option value="PRIVATE_LIMITED">Private Limited</option>
                  <option value="LLP">LLP</option>
                </select>
                {sellerForm.formState.errors.businessType && <p className="error-msg">{sellerForm.formState.errors.businessType.message}</p>}
              </div>
              <div>
                <label className="label">GST Number</label>
                <input {...sellerForm.register('gstNumber')} onChange={(e) => sellerForm.setValue('gstNumber', e.target.value.toUpperCase())} className="input" />
                {sellerForm.formState.errors.gstNumber && <p className="error-msg">{sellerForm.formState.errors.gstNumber.message}</p>}
              </div>
              <div>
                <label className="label">PAN Number</label>
                <input {...sellerForm.register('panNumber')} onChange={(e) => sellerForm.setValue('panNumber', e.target.value.toUpperCase())} className="input" />
                {sellerForm.formState.errors.panNumber && <p className="error-msg">{sellerForm.formState.errors.panNumber.message}</p>}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 pt-2">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Address Line 1 *</label>
                <input {...sellerForm.register('addressLine1')} className="input" />
                {sellerForm.formState.errors.addressLine1 && <p className="error-msg">{sellerForm.formState.errors.addressLine1.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address Line 2</label>
                <input {...sellerForm.register('addressLine2')} className="input" />
              </div>
              <div>
                <label className="label">City *</label>
                <input {...sellerForm.register('city')} className="input" />
                {sellerForm.formState.errors.city && <p className="error-msg">{sellerForm.formState.errors.city.message}</p>}
              </div>
              <div>
                <label className="label">State *</label>
                <select {...sellerForm.register('state')} className="input">
                  <option value="">Select state/UT</option>
                  {INDIAN_STATES_AND_UTS.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {sellerForm.formState.errors.state && <p className="error-msg">{sellerForm.formState.errors.state.message}</p>}
              </div>
              <div>
                <label className="label">Pincode *</label>
                <input {...sellerForm.register('pincode')} className="input" maxLength={6} />
                {sellerForm.formState.errors.pincode && <p className="error-msg">{sellerForm.formState.errors.pincode.message}</p>}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 pt-2">Identity Verification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">ID Type *</label>
                <select {...sellerForm.register('idType')} className="input">
                  <option value="">Select…</option>
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="VOTER_ID">Voter ID</option>
                </select>
                {sellerForm.formState.errors.idType && <p className="error-msg">{sellerForm.formState.errors.idType.message}</p>}
              </div>
              <div>
                <label className="label">ID Number *</label>
                <input {...sellerForm.register('idNumber')} className="input" />
                {sellerForm.formState.errors.idNumber && <p className="error-msg">{sellerForm.formState.errors.idNumber.message}</p>}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 pt-2">Bank Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Bank Name *</label>
                <select {...sellerForm.register('bankName')} className="input">
                  <option value="">Select bank</option>
                  {BANK_OPTIONS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                {sellerForm.formState.errors.bankName && <p className="error-msg">{sellerForm.formState.errors.bankName.message}</p>}
              </div>
              <div>
                <label className="label">Account Number *</label>
                <input {...sellerForm.register('bankAccountNumber')} className="input" />
                {sellerForm.formState.errors.bankAccountNumber && <p className="error-msg">{sellerForm.formState.errors.bankAccountNumber.message}</p>}
              </div>
              <div>
                <label className="label">IFSC Code *</label>
                <input {...sellerForm.register('bankIfscCode')} onChange={(e) => sellerForm.setValue('bankIfscCode', e.target.value.toUpperCase())} className="input" />
                {sellerForm.formState.errors.bankIfscCode && <p className="error-msg">{sellerForm.formState.errors.bankIfscCode.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={sellerDetailMut.isPending} className="btn-primary py-2.5 mt-2">
              {sellerDetailMut.isPending ? 'Submitting…' : 'Submit for Verification'}
            </button>
          </form>
        </div>
      )}

      {/* Password change modal */}
      <Modal open={pwModal} onClose={() => setPwModal(false)} title="Change Password">
        <form onSubmit={pwForm.handleSubmit((d) => pwMut.mutate(d))} className="flex flex-col gap-4">
          <div>
            <label className="label">Current Password</label>
            <input {...pwForm.register('currentPassword')} type="password" className="input" />
            {pwForm.formState.errors.currentPassword && <p className="error-msg">{pwForm.formState.errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="label">New Password</label>
            <input {...pwForm.register('newPassword')} type="password" className="input" />
            {pwForm.formState.errors.newPassword && <p className="error-msg">{pwForm.formState.errors.newPassword.message}</p>}
            <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 number, 1 special char</p>
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input {...pwForm.register('confirmNewPassword')} type="password" className="input" />
            {pwForm.formState.errors.confirmNewPassword && <p className="error-msg">{pwForm.formState.errors.confirmNewPassword.message}</p>}
          </div>
          <button type="submit" disabled={pwMut.isPending} className="btn-primary py-2.5">
            {pwMut.isPending ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
