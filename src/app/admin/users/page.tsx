'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  Ban,
  CheckCircle,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Calendar,
  Users,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  getAdminUsers,
  updateUserRole,
  banUser,
  unbanUser,
  verifyUser,
  unverifyUser,
  suspendUser,
  unsuspendUser,
  type AdminUser,
  type AdminUsersResponse
} from '@/services/userService'
import { motion, AnimatePresence } from 'framer-motion'

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Estados para modales y acciones
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, searchTerm, roleFilter, statusFilter, sortBy, sortOrder])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      } = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      }

      // Solo agregar propiedades que no sean undefined o vacías
      if (searchTerm.trim()) {
        params.search = searchTerm
      }
      if (roleFilter) {
        params.role = roleFilter
      }
      if (statusFilter) {
        params.status = statusFilter
      }

      const response: AdminUsersResponse = await getAdminUsers(params)
      setUsers(response.users)
      setPagination(prev => ({
        ...prev,
        total: response.total,
        pages: response.pages
      }))
    } catch (err) {
      setError('Error al cargar usuarios')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    try {
      await updateUserRole(userId, newRole)
      fetchUsers() // Recargar lista
      setShowRoleModal(false)
    } catch (err) {
      console.error('Error updating role:', err)
    }
  }

  const handleBanUser = async (userId: string, reason: string, duration?: number) => {
    try {
      await banUser(userId, reason, duration)
      fetchUsers()
      setShowBanModal(false)
    } catch (err) {
      console.error('Error banning user:', err)
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId)
      fetchUsers()
    } catch (err) {
      console.error('Error unbanning user:', err)
    }
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      await verifyUser(userId)
      fetchUsers()
    } catch (err) {
      console.error('Error verifying user:', err)
    }
  }

  const handleUnverifyUser = async (userId: string) => {
    try {
      await unverifyUser(userId)
      fetchUsers()
    } catch (err) {
      console.error('Error unverifying user:', err)
    }
  }

  const handleSuspendUser = async (userId: string, reason: string, duration: number) => {
    try {
      await suspendUser(userId, reason, duration)
      fetchUsers()
      setShowSuspendModal(false)
    } catch (err) {
      console.error('Error suspending user:', err)
    }
  }

  const handleUnsuspendUser = async (userId: string) => {
    try {
      await unsuspendUser(userId)
      fetchUsers()
    } catch (err) {
      console.error('Error unsuspending user:', err)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusBadgeColor = (user: AdminUser) => {
    if (user.isBanned) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    if (!user.isActive) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  }

  const getStatusText = (user: AdminUser) => {
    if (user.isBanned) return 'Baneado'
    if (!user.isActive) return 'Suspendido'
    return 'Activo'
  }

  if (loading && users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra usuarios, roles y permisos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pagination.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Administradores</p>
              <p className="text-3xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Moderadores</p>
              <p className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === 'moderator').length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Verificados</p>
              <p className="text-3xl font-bold text-green-600">{users.filter(u => u.isVerified).length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="moderator">Moderadores</option>
            <option value="user">Usuarios</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="banned">Baneados</option>
            <option value="suspended">Suspendidos</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order as 'asc' | 'desc')
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt-desc">Más recientes</option>
            <option value="createdAt-asc">Más antiguos</option>
            <option value="username-asc">Nombre A-Z</option>
            <option value="username-desc">Nombre Z-A</option>
            <option value="postsCount-desc">Más posts</option>
            <option value="followersCount-desc">Más seguidores</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estadísticas
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar}
                              alt={user.username}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {user.username[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.fullName || user.username}
                            </div>
                            {user.isVerified && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'admin' ? 'Administrador' : user.role === 'moderator' ? 'Moderador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user)}`}>
                        {getStatusText(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div>{user.postsCount} posts</div>
                        <div>{user.followersCount} seguidores</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserDetails(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowRoleModal(true)
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Cambiar rol"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        {user.isBanned ? (
                          <button
                            onClick={() => handleUnbanUser(user._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Desbanear usuario"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowBanModal(true)
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Banear usuario"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {!user.isActive && !user.isBanned ? (
                          <button
                            onClick={() => handleUnsuspendUser(user._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Desuspender usuario"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : !user.isBanned ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowSuspendModal(true)
                            }}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Suspender usuario"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando{' '}
                    <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                    {' '}a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{pagination.total}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.page === pageNum
                            ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalles del Usuario */}
      <AnimatePresence>
        {showUserDetails && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Detalles del Usuario
                  </h2>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Información Básica */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {selectedUser.avatar ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={selectedUser.avatar}
                          alt={selectedUser.username}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                          {selectedUser.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {selectedUser.fullName || selectedUser.username}
                        </h3>
                        {selectedUser.isVerified && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">@{selectedUser.username}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                          {selectedUser.role === 'admin' ? 'Administrador' : selectedUser.role === 'moderator' ? 'Moderador' : 'Usuario'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedUser)}`}>
                          {getStatusText(selectedUser)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha de Registro
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {selectedUser.lastLoginAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Último Acceso
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(selectedUser.lastLoginAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {selectedUser.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Biografía
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedUser.bio}</p>
                    </div>
                  )}

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedUser.postsCount}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedUser.followersCount}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Seguidores</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedUser.followingCount}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Siguiendo</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedUser.reportsCount}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reportes</p>
                    </div>
                  </div>

                  {/* Información de Ban/Suspensión */}
                  {selectedUser.isBanned && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Ban className="w-5 h-5 text-red-500" />
                        <h4 className="font-medium text-red-800 dark:text-red-200">Usuario Baneado</h4>
                      </div>
                      {selectedUser.banReason && (
                        <p className="text-sm text-red-700 dark:text-red-300 mb-1">
                          <strong>Razón:</strong> {selectedUser.banReason}
                        </p>
                      )}
                      {selectedUser.banExpiresAt && (
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Expira:</strong> {new Date(selectedUser.banExpiresAt).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Acciones Rápidas */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowUserDetails(false)
                        setShowRoleModal(true)
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Cambiar Rol
                    </button>

                    {selectedUser.isBanned ? (
                      <button
                        onClick={() => {
                          handleUnbanUser(selectedUser._id)
                          setShowUserDetails(false)
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Desbanear
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowUserDetails(false)
                          setShowBanModal(true)
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Banear
                      </button>
                    )}

                    {selectedUser.isVerified ? (
                      <button
                        onClick={() => {
                          handleUnverifyUser(selectedUser._id)
                          setShowUserDetails(false)
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Desverificar
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleVerifyUser(selectedUser._id)
                          setShowUserDetails(false)
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verificar
                      </button>
                    )}

                    {!selectedUser.isActive && !selectedUser.isBanned ? (
                      <button
                        onClick={() => {
                          handleUnsuspendUser(selectedUser._id)
                          setShowUserDetails(false)
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Desuspender
                      </button>
                    ) : !selectedUser.isBanned ? (
                      <button
                        onClick={() => {
                          setShowUserDetails(false)
                          setShowSuspendModal(true)
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Suspender
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Cambio de Rol */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRoleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Cambiar Rol de Usuario
                  </h2>
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Información del Usuario */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {selectedUser.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {selectedUser.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedUser.fullName || selectedUser.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{selectedUser.username}</p>
                    </div>
                  </div>

                  {/* Rol Actual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rol Actual
                    </label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role === 'admin' ? 'Administrador' : selectedUser.role === 'moderator' ? 'Moderador' : 'Usuario'}
                    </span>
                  </div>

                  {/* Selección de Nuevo Rol */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nuevo Rol
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'user', label: 'Usuario', description: 'Acceso básico a la plataforma' },
                        { value: 'moderator', label: 'Moderador', description: 'Puede moderar contenido y usuarios' },
                        { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' }
                      ].map((role) => (
                        <label key={role.value} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name="newRole"
                            value={role.value}
                            defaultChecked={selectedUser.role === role.value}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100">{role.label}</span>
                              {role.value === 'admin' && (
                                <Shield className="w-4 h-4 text-red-500" />
                              )}
                              {role.value === 'moderator' && (
                                <UserCheck className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Advertencia para Admin */}
                  {selectedUser.role !== 'admin' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Advertencia</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Los administradores tienen acceso completo al sistema. Asegúrate de que este usuario sea de confianza.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones de Acción */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const newRoleInput = document.querySelector('input[name="newRole"]:checked') as HTMLInputElement
                        if (newRoleInput && selectedUser) {
                          handleRoleChange(selectedUser._id, newRoleInput.value as 'user' | 'moderator' | 'admin')
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cambiar Rol
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Banear Usuario */}
      <AnimatePresence>
        {showBanModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Banear Usuario
                  </h2>
                  <button
                    onClick={() => setShowBanModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Información del Usuario */}
                  <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    {selectedUser.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {selectedUser.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedUser.fullName || selectedUser.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{selectedUser.username}</p>
                    </div>
                    <Ban className="w-5 h-5 text-red-500 ml-auto" />
                  </div>

                  {/* Advertencia */}
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 dark:text-red-200">Advertencia</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Al banear a este usuario, perderá acceso completo a la plataforma. Esta acción puede ser temporal o permanente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formulario de Ban */}
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const reason = formData.get('reason') as string
                    const duration = formData.get('duration') as string
                    const durationDays = duration ? parseInt(duration) : undefined

                    if (reason.trim()) {
                      handleBanUser(selectedUser._id, reason, durationDays)
                    }
                  }} className="space-y-4">
                    {/* Razón del Ban */}
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Razón del Ban *
                      </label>
                      <textarea
                        id="reason"
                        name="reason"
                        rows={3}
                        required
                        placeholder="Describe la razón por la cual se banea al usuario..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>

                    {/* Duración del Ban */}
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duración del Ban
                      </label>
                      <select
                        id="duration"
                        name="duration"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">Permanente</option>
                        <option value="1">1 día</option>
                        <option value="3">3 días</option>
                        <option value="7">1 semana</option>
                        <option value="14">2 semanas</option>
                        <option value="30">1 mes</option>
                        <option value="90">3 meses</option>
                        <option value="365">1 año</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Deja vacío para un ban permanente
                      </p>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowBanModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Banear Usuario
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Suspender Usuario */}
      <AnimatePresence>
        {showSuspendModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuspendModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Suspender Usuario
                  </h2>
                  <button
                    onClick={() => setShowSuspendModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Información del Usuario */}
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    {selectedUser.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {selectedUser.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedUser.fullName || selectedUser.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{selectedUser.username}</p>
                    </div>
                    <Clock className="w-5 h-5 text-yellow-500 ml-auto" />
                  </div>

                  {/* Información sobre Suspensión */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Suspensión Temporal</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          La suspensión es una medida temporal que restringe ciertas actividades del usuario sin banearlo completamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formulario de Suspensión */}
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const reason = formData.get('reason') as string
                    const duration = formData.get('duration') as string
                    const durationDays = parseInt(duration)

                    if (reason.trim() && durationDays > 0) {
                      handleSuspendUser(selectedUser._id, reason, durationDays)
                    }
                  }} className="space-y-4">
                    {/* Razón de la Suspensión */}
                    <div>
                      <label htmlFor="suspendReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Razón de la Suspensión *
                      </label>
                      <textarea
                        id="suspendReason"
                        name="reason"
                        rows={3}
                        required
                        placeholder="Describe la razón por la cual se suspende al usuario..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>

                    {/* Duración de la Suspensión */}
                    <div>
                      <label htmlFor="suspendDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duración de la Suspensión *
                      </label>
                      <select
                        id="suspendDuration"
                        name="duration"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">Selecciona duración</option>
                        <option value="1">1 día</option>
                        <option value="3">3 días</option>
                        <option value="7">1 semana</option>
                        <option value="14">2 semanas</option>
                        <option value="30">1 mes</option>
                        <option value="90">3 meses</option>
                      </select>
                    </div>

                    {/* Restricciones */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Restricciones Aplicadas
                      </label>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>No puede crear nuevos posts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>No puede comentar en posts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>No puede seguir nuevos usuarios</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Puede ver contenido pero no interactuar</span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowSuspendModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Suspender Usuario
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

