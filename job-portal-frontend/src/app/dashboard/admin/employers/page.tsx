"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { apiGet } from "@/lib/api";

interface EmployerAccount {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  phone?: string;
  user: {
    id: string;
    email: string;
    status: string;
    createdAt: string;
  };
  company: {
    id: string;
    name: string;
    industry?: string;
    location?: string;
    website?: string;
    _count?: { jobs: number };
  };
}

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<EmployerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadEmployers() {
      try {
        const res = await apiGet<EmployerAccount[]>("/admin/employers");
        if (Array.isArray(res) && res.length > 0) {
          setEmployers(res);
        } else {
          loadFallback();
        }
      } catch {
        loadFallback();
      } finally {
        setLoading(false);
      }
    }

    function loadFallback() {
      setEmployers([
        {
          id: "emp-1",
          firstName: "Admin",
          lastName: "Recruiter",
          jobTitle: "Talent Partner",
          phone: "+977 1 4455667",
          user: {
            id: "u-emp-1",
            email: "recruiter@technova.com",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
          company: {
            id: "c-1",
            name: "TechNova Solutions",
            industry: "Information Technology",
            location: "Kathmandu, Nepal",
            website: "https://technova.example.com",
            _count: { jobs: 8 },
          },
        },
        {
          id: "emp-2",
          firstName: "Sophia",
          lastName: "Miller",
          jobTitle: "Operations VP",
          phone: "+1 415 555 0199",
          user: {
            id: "u-emp-2",
            email: "sophia@cloudscale.io",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
          company: {
            id: "c-2",
            name: "CloudScale Inc.",
            industry: "Cloud Infrastructure",
            location: "San Francisco / Remote",
            website: "https://cloudscale.io",
            _count: { jobs: 5 },
          },
        },
      ]);
    }

    loadEmployers();
  }, []);

  const filtered = employers.filter((emp) =>
    emp.company.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.user.email.toLowerCase().includes(search.toLowerCase()) ||
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout allowedRole="ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="Employer &amp; Enterprise Governance"
          description="Review organizational credentials, verify corporate accounts, and monitor job volume."
        />

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name or recruiter email..."
            className="pl-9 h-10 rounded-xl bg-white dark:bg-neutral-900"
          />
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/40">
                <TableHead>Company</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Industry &amp; Location</TableHead>
                <TableHead>Jobs Posted</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold text-xs dark:bg-white dark:text-neutral-900">
                        {emp.company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {emp.company.name}
                        </p>
                        {emp.company.website && (
                          <a
                            href={emp.company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            Visit website <ExternalLink className="size-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <span className="text-neutral-400">{emp.user.email}</span>
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500">
                    <p>{emp.company.industry || "General Tech"}</p>
                    <span className="text-neutral-400">{emp.company.location || "Global"}</span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {emp.company._count?.jobs ?? 0} Listings
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-emerald-600 text-[10px]">
                      Verified
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                          <MoreVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ShieldCheck className="size-3.5 mr-2 text-emerald-600" />
                          Verify Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem destructive>
                          <XCircle className="size-3.5 mr-2" />
                          Suspend Employer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
