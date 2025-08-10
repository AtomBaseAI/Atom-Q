
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  UserPlus,
  UserMinus,
  Users,
  BookOpen,
  ArrowUpDown,
  ChevronLeft,
  Filter,
  X
} from "lucide-react"
import { toasts } from "@/lib/toasts"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

// Import toast functions that were missing in the original code
import { toast } from "sonner";
import HexagonLoader from "@/components/Loader/Loading"

interface User {
  id: string
  name: string
  email: string
  campus?: string
  tags?: string[]
  enrolled: boolean
}

interface Quiz {
  id: string
  title: string
  description?: string
  category?: { name: string }
  timeLimit?: number
  difficulty: string
  status: string
}

export default function QuizUsersPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false)
  const [userToUnenroll, setUserToUnenroll] = useState<User | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // Filter states for enrollment popup
  const [enrollSearchTerm, setEnrollSearchTerm] = useState("")
  const [enrollCampusFilter, setEnrollCampusFilter] = useState("")
  const [enrollTagsFilter, setEnrollTagsFilter] = useState("")
  const [showEnrollFilters, setShowEnrollFilters] = useState(false)

  // Get unique campuses and tags from available users
  const uniqueCampuses = Array.from(new Set(availableUsers.map(user => user.campus).filter(Boolean)))
  const uniqueTags = Array.from(new Set(availableUsers.flatMap(user => user.tags || [])))

  useEffect(() => {
    fetchQuizData()
    fetchEnrolledUsers()
  }, [quizId])

  useEffect(() => {
    if (isEnrollDialogOpen) {
      fetchAvailableUsers()
    }
  }, [isEnrollDialogOpen, enrollSearchTerm, enrollCampusFilter, enrollTagsFilter])

  const fetchQuizData = async () => {
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}`)
      if (response.ok) {
        const data = await response.json()
        setQuiz(data)
      }
    } catch (error) {
      console.error("Error fetching quiz:", error)
    }
  }

  const fetchEnrolledUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/users`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching enrolled users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const params = new URLSearchParams({
        quizId,
        ...(enrollSearchTerm && { search: enrollSearchTerm }),
        ...(enrollCampusFilter && { campus: enrollCampusFilter }),
        ...(enrollTagsFilter && { tags: enrollTagsFilter })
      })
      
      const response = await fetch(`/api/admin/students/available?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data)
      }
    } catch (error) {
      console.error("Error fetching available users:", error)
    }
  }

  const handleEnrollUsers = async () => {
    if (selectedUsers.length === 0) return

    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers
        })
      })

      if (response.ok) {
        toast.success(`${selectedUsers.length} user(s) enrolled successfully`)
        setIsEnrollDialogOpen(false)
        setSelectedUsers([])
        // Reset filters
        setEnrollSearchTerm("")
        setEnrollCampusFilter("")
        setEnrollTagsFilter("")
        setShowEnrollFilters(false)
        fetchEnrolledUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to enroll users')
      }
    } catch (error) {
      toast.error('Failed to enroll users')
    }
  }

  const handleUnenrollUser = async () => {
    if (!userToUnenroll) return

    try {
      const response = await fetch(`/api/admin/quiz/${quizId}/users/${userToUnenroll.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('User unenrolled successfully')
        setIsUnenrollDialogOpen(false)
        setUserToUnenroll(null)
        fetchEnrolledUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to unenroll user')
      }
    } catch (error) {
      toast.error('Failed to unenroll user')
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUserToUnenroll(user)
              setIsUnenrollDialogOpen(true)
            }}
            className="text-red-600 hover:text-red-700"
          >
            <UserMinus className="h-4 w-4 mr-1" />
            Unenroll
          </Button>
        )
      },
    },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-[80vh] "><HexagonLoader size={80} /></div>
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-center">
        <div className="flex flex-row justify-start items-center w-1/2 gap-1">
          <div className="h-full flex flex-row drak:bg-slate-400 mr-2">
            <h1 className="mr-1">{quiz?.title} </h1> (<p>{users.length}</p>) 
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-end items-center w-1/2 gap-1">
          <Button
            onClick={() => {
              // Reset filters when opening dialog
              setEnrollSearchTerm("")
              setEnrollCampusFilter("")
              setEnrollTagsFilter("")
              setShowEnrollFilters(false)
              setIsEnrollDialogOpen(true)
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll Users
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={filteredUsers} />

      {/* Enroll Users Dialog */}
      <Sheet open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <SheetContent className="min-w-[100vw] sm:w-[90vw]">
          <SheetHeader>
            <SheetTitle>Enroll Users</SheetTitle>
            <SheetDescription>
              Select users to enroll in this quiz
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 px-4">
            <div className="space-y-4">
              {/* Search and Filters Section */}
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={enrollSearchTerm}
                    onChange={(e) => setEnrollSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEnrollFilters(!showEnrollFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {(enrollCampusFilter || enrollTagsFilter) && (
                      <Badge variant="secondary" className="ml-1">
                        {(enrollCampusFilter ? 1 : 0) + (enrollTagsFilter ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                  
                  {(enrollCampusFilter || enrollTagsFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEnrollCampusFilter("")
                        setEnrollTagsFilter("")
                      }}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Filter Options */}
                {showEnrollFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Campus</Label>
                      <Select value={enrollCampusFilter} onValueChange={setEnrollCampusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Campuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Campuses</SelectItem>
                          {uniqueCampuses.map((campus) => (
                            <SelectItem key={campus} value={campus}>
                              {campus}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tags</Label>
                      <Select value={enrollTagsFilter} onValueChange={setEnrollTagsFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Tags" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Tags</SelectItem>
                          {uniqueTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Users List */}
              <div className="min-h-[50vh] overflow-y-auto space-y-2">
                {availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <div key={user.id} className="flex items-start space-x-3 p-3 border rounded hover:bg-muted/50">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                        className="h-4 w-4 mt-1"
                      />
                      <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.campus && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Campus: {user.campus}
                          </div>
                        )}
                        {user.tags && user.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {enrollSearchTerm || enrollCampusFilter || enrollTagsFilter
                      ? "No users match your search criteria"
                      : "No available users found"
                    }
                  </div>
                )}
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedUsers.length} user(s) selected
                </div>
              )}
            </div>
          </div>
          <SheetFooter className="mt-6">
            <div className="flex flex-row flex-1 gap-3 w-full justify-center items-center px-4">
              <div className="w-1/2 flex justify-start items-center">
                <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
              <div className="w-1/2 flex justify-end items-center">
                <Button
                  onClick={handleEnrollUsers}
                  disabled={selectedUsers.length === 0}
                >
                  Enroll Selected Users ({selectedUsers.length})
                </Button>

              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Unenroll User Dialog */}
      <AlertDialog open={isUnenrollDialogOpen} onOpenChange={setIsUnenrollDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unenroll User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unenroll "{userToUnenroll?.name}" from this quiz?
              This action cannot be undone and will remove their quiz data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToUnenroll(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnenrollUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Unenroll User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}