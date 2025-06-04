import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ConsolidatedData {
  id: string;
  barangay: string;
  age_bracket: string;
  gender: string;
  year: number;
  month: string;
  count: number;
}

interface ConsolidatedAnalyticsProps {
  data: ConsolidatedData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function ConsolidatedAnalytics({ data }: ConsolidatedAnalyticsProps) {
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedMonth, setSelectedMonth] = useState<string>("All");

  // Get unique years and months from data
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(data.map(record => record.year.toString()))).sort();
    return ["All", ...years];
  }, [data]);

  const availableMonths = useMemo(() => {
    return ["All", ...MONTHS];
  }, []);

  // Filter data based on selected year and month
  const filteredData = useMemo(() => {
    let filtered = data;

    if (selectedYear !== "All") {
      filtered = filtered.filter(record => record.year.toString() === selectedYear);
    }

    if (selectedMonth !== "All") {
      filtered = filtered.filter(record => record.month === selectedMonth);
    }

    return filtered;
  }, [data, selectedYear, selectedMonth]);

  // Aggregate data by barangay
  const barangayData = useMemo(() => {
    const aggregated = filteredData.reduce((acc: { [key: string]: number }, record) => {
      if (!acc[record.barangay]) {
        acc[record.barangay] = 0;
      }
      acc[record.barangay] += record.count;
      return acc;
    }, {});

    return Object.entries(aggregated).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredData]);

  // Aggregate data by age bracket
  const ageBracketData = useMemo(() => {
    const aggregated = filteredData.reduce((acc: { [key: string]: number }, record) => {
      if (!acc[record.age_bracket]) {
        acc[record.age_bracket] = 0;
      }
      acc[record.age_bracket] += record.count;
      return acc;
    }, {});

    return Object.entries(aggregated).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredData]);

  // Aggregate data by gender
  const genderData = useMemo(() => {
    const aggregated = filteredData.reduce((acc: { [key: string]: number }, record) => {
      if (!acc[record.gender]) {
        acc[record.gender] = 0;
      }
      acc[record.gender] += record.count;
      return acc;
    }, {});

    return Object.entries(aggregated).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredData]);

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const aggregated = filteredData.reduce((acc: { [key: string]: number }, record) => {
      const monthYear = selectedYear === "All" ? `${record.month} ${record.year}` : record.month;
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += record.count;
      return acc;
    }, {});

    return Object.entries(aggregated).map(([name, value]) => ({
      name,
      value
    }));
  }, [filteredData, selectedYear]);

  const totalPopulation = useMemo(() => {
    return filteredData.reduce((sum, record) => sum + record.count, 0);
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Compact Filter Controls */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Label htmlFor="year-filter" className="text-sm font-medium whitespace-nowrap">Year:</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger id="year-filter" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year === "All" ? "All Years" : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="month-filter" className="text-sm font-medium whitespace-nowrap">Month:</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger id="month-filter" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {month === "All" ? "All Months" : month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground ml-auto">
          {selectedYear === "All" && selectedMonth === "All" 
            ? `All periods (${filteredData.length} records)`
            : `${selectedMonth === "All" ? "All months" : selectedMonth} ${selectedYear === "All" ? "all years" : selectedYear} (${filteredData.length} records)`
          }
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Population</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPopulation.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Barangays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{barangayData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Age Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ageBracketData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Population by Barangay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barangayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageBracketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
