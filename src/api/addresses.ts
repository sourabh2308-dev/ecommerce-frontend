import api from './client'
import type { Address, AddressRequest } from '@/types'

export const getAddresses = () =>
  api.get<Address[]>('/user/addresses').then((r) => r.data)

export const getAddress = (uuid: string) =>
  api.get<Address>(`/user/addresses/${uuid}`).then((r) => r.data)

export const createAddress = (data: AddressRequest) =>
  api.post<Address>('/user/addresses', data).then((r) => r.data)

export const updateAddress = (uuid: string, data: AddressRequest) =>
  api.put<Address>(`/user/addresses/${uuid}`, data).then((r) => r.data)

export const deleteAddress = (uuid: string) =>
  api.delete(`/user/addresses/${uuid}`).then((r) => r.data)

export const setDefaultAddress = (uuid: string) =>
  api.put<Address>(`/user/addresses/${uuid}/default`).then((r) => r.data)
