
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function ConsolidatedAnalytics({ data }: ConsolidatedAnalyticsProps) {
  // Aggregate data by barangay
  const barangayData = data.reduce((acc: { [key: string]: number }, record) => {
    if (!acc[record.barangay]) {
      acc[record.barangay] = 0;
    }
    acc[record.barangay] += record.count;
    return acc;
  }, {});

  const barangayChartData = Object.entries(barangayData).map(([name, value]) => ({
    name,
    value
  }));

  // Aggregate data by age bracket
  const ageBracketData = data.reduce((acc: { [key: string]: number }, record) => {
    if (!acc[record.age_bracket]) {
      acc[record.age_bracket] = 0;
    }
    acc[record.age_bracket] += record.count;
    return acc;
  }, {});

  const ageBracketChartData = Object.entries(ageBracketData).map(([name, value]) => ({
    name,
    value
  }));

  // Aggregate data by gender
  const genderData = data.reduce((acc: { [key: string]: number }, record) => {
    if (!acc[record.gender]) {
      acc[record.gender] = 0;
    }
    acc[record.gender] += record.count;
    return acc;
  }, {});

  const genderChartData = Object.entries(genderData).map(([name, value]) => ({
    name,
    value
  }));

  // Monthly trend data
  const monthlyData = data.reduce((acc: { [key: string]: number }, record) => {
    const monthYear = `${record.month} ${record.year}`;
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear] += record.count;
    return acc;
  }, {});

  const monthlyChartData = Object.entries(monthlyData).map(([name, value]) => ({
    name,
    value
  }));

  const totalPopulation = data.reduce((sum, record) => sum + record.count, 0);

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{Object.keys(barangayData).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Age Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(ageBracketData).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
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
                <BarChart data={barangayChartData}>
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
                    data={genderChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderChartData.map((entry, index) => (
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
                <BarChart data={ageBracketChartData}>
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
                <BarChart data={monthlyChartData}>
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
