import { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Group,
  Text,
  Button,
  Stack,
  Select,
  Grid,
  Paper,
  Table,
  Badge,
  Container,
  Tabs,
  ThemeIcon,
  SimpleGrid,
  ScrollArea,
  NumberFormatter
} from '@mantine/core';
import {
  IconDownload,
  IconPrinter,
  IconCalendar,
  IconTrendingUp,
  IconCurrencyRupee,
  IconUsers,
  IconFileAnalytics,
  IconChartBar,
  IconChartLine,
  IconChartPie
} from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { BarChart, PieChart } from '@mantine/charts';
import { notifications } from '@mantine/notifications';
import api from '../api/config';

interface ReportData {
  collection_summary?: Array<{
    date: string;
    total_collected: number;
    transaction_count: number;
  }>;
  outstanding_fees?: Array<{
    id: number;
    student: {
      first_name: string;
      last_name: string;
      register_no: string;
    };
    feeType: {
      name: string;
    };
    amount: number;
    paid_amount: number;
    due_date: string;
    status: string;
  }>;
  fee_type_analysis?: Array<{
    fee_type_id: number;
    total_assigned: number;
    total_collected: number;
    student_count: number;
    feeType: {
      name: string;
    };
  }>;
}

const FinancialReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({});
  const [reportType, setReportType] = useState<string>('collection_summary');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date()
  ]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedFeeType, setSelectedFeeType] = useState<string>('');

  useEffect(() => {
    if (reportType) {
      generateReport();
    }
  }, [reportType, dateRange, selectedClass, selectedFeeType]);

  const generateReport = async () => {
    try {
      setLoading(true);
      const params: any = {
        report_type: reportType
      };

      if (dateRange[0] && dateRange[1]) {
        params.date_from = dateRange[0].toISOString().split('T')[0];
        params.date_to = dateRange[1].toISOString().split('T')[0];
      }

      if (selectedClass) params.class_id = selectedClass;
      if (selectedFeeType) params.fee_type_id = selectedFeeType;

      const response = await api.get('/api/finance/reports', { params });
      
      if (response.data.success) {
        setReportData({ [reportType]: response.data.data });
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to generate report',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    // Implement export functionality
    notifications.show({
      title: 'Export Started',
      message: `Report export in ${format.toUpperCase()} format started`,
      color: 'blue'
    });
  };

  const printReport = () => {
    window.print();
  };

  const renderCollectionSummary = () => {
    const data = reportData.collection_summary || [];
    
    if (data.length === 0) {
      return (
        <Text c="dimmed" ta="center" py="xl">
          No collection data available for the selected period
        </Text>
      );
    }

    const chartData = data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      collected: item.total_collected,
      transactions: item.transaction_count
    }));

    const totalCollected = data.reduce((sum, item) => sum + item.total_collected, 0);
    const totalTransactions = data.reduce((sum, item) => sum + item.transaction_count, 0);

    return (
      <Stack>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Paper withBorder p="md">
            <Group>
              <ThemeIcon size="lg" color="green" variant="light">
                <IconCurrencyRupee size={24} />
              </ThemeIcon>
              <div>
                <Text size="sm" c="dimmed">Total Collected</Text>
                <Text size="xl" fw={700}>
                  <NumberFormatter value={totalCollected} prefix="₹" thousandSeparator />
                </Text>
              </div>
            </Group>
          </Paper>
          
          <Paper withBorder p="md">
            <Group>
              <ThemeIcon size="lg" color="blue" variant="light">
                <IconUsers size={24} />
              </ThemeIcon>
              <div>
                <Text size="sm" c="dimmed">Total Transactions</Text>
                <Text size="xl" fw={700}>{totalTransactions}</Text>
              </div>
            </Group>
          </Paper>
          
          <Paper withBorder p="md">
            <Group>
              <ThemeIcon size="lg" color="indigo" variant="light">
                <IconTrendingUp size={24} />
              </ThemeIcon>
              <div>
                <Text size="sm" c="dimmed">Average per Transaction</Text>
                <Text size="xl" fw={700}>
                  <NumberFormatter 
                    value={totalTransactions > 0 ? totalCollected / totalTransactions : 0} 
                    prefix="₹" 
                    thousandSeparator 
                  />
                </Text>
              </div>
            </Group>
          </Paper>
        </SimpleGrid>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Daily Collection Trend</Title>
          <BarChart
            h={300}
            data={chartData}
            dataKey="date"
            series={[
              { name: 'collected', color: 'blue.6', label: 'Amount Collected (₹)' }
            ]}
            tickLine="y"
          />
        </Paper>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Collection Details</Title>
          <ScrollArea>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Amount Collected</Table.Th>
                  <Table.Th>Number of Transactions</Table.Th>
                  <Table.Th>Average per Transaction</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{new Date(item.date).toLocaleDateString()}</Table.Td>
                    <Table.Td>
                      <NumberFormatter value={item.total_collected} prefix="₹" thousandSeparator />
                    </Table.Td>
                    <Table.Td>{item.transaction_count}</Table.Td>
                    <Table.Td>
                      <NumberFormatter 
                        value={item.transaction_count > 0 ? item.total_collected / item.transaction_count : 0}
                        prefix="₹" 
                        thousandSeparator 
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </Stack>
    );
  };

  const renderOutstandingFees = () => {
    const data = reportData.outstanding_fees || [];
    
    if (data.length === 0) {
      return (
        <Text c="dimmed" ta="center" py="xl">
          No outstanding fees found
        </Text>
      );
    }

    const totalOutstanding = data.reduce((sum, item) => sum + (item.amount - item.paid_amount), 0);

    return (
      <Stack>
        <Paper withBorder p="md">
          <Group>
            <ThemeIcon size="lg" color="red" variant="light">
              <IconCurrencyRupee size={24} />
            </ThemeIcon>
            <div>
              <Text size="sm" c="dimmed">Total Outstanding</Text>
              <Text size="xl" fw={700} c="red">
                <NumberFormatter value={totalOutstanding} prefix="₹" thousandSeparator />
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Outstanding Fees Details</Title>
          <ScrollArea>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Student</Table.Th>
                  <Table.Th>Fee Type</Table.Th>
                  <Table.Th>Total Amount</Table.Th>
                  <Table.Th>Paid Amount</Table.Th>
                  <Table.Th>Outstanding</Table.Th>
                  <Table.Th>Due Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.map((item, index) => {
                  const outstanding = item.amount - item.paid_amount;
                  const isOverdue = new Date(item.due_date) < new Date();
                  
                  return (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <div>
                          <Text fw={500}>
                            {item.student.first_name} {item.student.last_name}
                          </Text>
                          <Text size="sm" c="dimmed">{item.student.register_no}</Text>
                        </div>
                      </Table.Td>
                      <Table.Td>{item.feeType.name}</Table.Td>
                      <Table.Td>
                        <NumberFormatter value={item.amount} prefix="₹" thousandSeparator />
                      </Table.Td>
                      <Table.Td>
                        <NumberFormatter value={item.paid_amount} prefix="₹" thousandSeparator />
                      </Table.Td>
                      <Table.Td>
                        <Text fw={700} c={outstanding > 0 ? 'red' : 'green'}>
                          <NumberFormatter value={outstanding} prefix="₹" thousandSeparator />
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text c={isOverdue ? 'red' : 'dimmed'}>
                          {new Date(item.due_date).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={isOverdue ? 'red' : item.status === 'paid' ? 'green' : 'yellow'} 
                          variant="light"
                        >
                          {isOverdue ? 'OVERDUE' : item.status.toUpperCase()}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </Stack>
    );
  };

  const renderFeeTypeAnalysis = () => {
    const data = reportData.fee_type_analysis || [];
    
    if (data.length === 0) {
      return (
        <Text c="dimmed" ta="center" py="xl">
          No fee type data available
        </Text>
      );
    }

    const pieData = data.map(item => ({
      name: item.feeType.name,
      value: item.total_assigned,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));

    return (
      <Stack>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <Paper withBorder p="md">
            <Title order={4} mb="md">Fee Type Distribution</Title>
            <PieChart
              h={300}
              data={pieData}
              withTooltip
              tooltipDataSource="segment"
            />
          </Paper>

          <Paper withBorder p="md">
            <Title order={4} mb="md">Collection Efficiency</Title>
            <BarChart
              h={300}
              data={data.map(item => ({
                feeType: item.feeType.name.substring(0, 10) + '...',
                assigned: item.total_assigned,
                collected: item.total_collected,
                efficiency: (item.total_collected / item.total_assigned) * 100
              }))}
              dataKey="feeType"
              series={[
                { name: 'assigned', color: 'blue.4', label: 'Assigned' },
                { name: 'collected', color: 'green.6', label: 'Collected' }
              ]}
            />
          </Paper>
        </SimpleGrid>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Fee Type Analysis Details</Title>
          <ScrollArea>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Fee Type</Table.Th>
                  <Table.Th>Students</Table.Th>
                  <Table.Th>Total Assigned</Table.Th>
                  <Table.Th>Total Collected</Table.Th>
                  <Table.Th>Outstanding</Table.Th>
                  <Table.Th>Collection Rate</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.map((item, index) => {
                  const outstanding = item.total_assigned - item.total_collected;
                  const collectionRate = (item.total_collected / item.total_assigned) * 100;
                  
                  return (
                    <Table.Tr key={index}>
                      <Table.Td>{item.feeType.name}</Table.Td>
                      <Table.Td>{item.student_count}</Table.Td>
                      <Table.Td>
                        <NumberFormatter value={item.total_assigned} prefix="₹" thousandSeparator />
                      </Table.Td>
                      <Table.Td>
                        <NumberFormatter value={item.total_collected} prefix="₹" thousandSeparator />
                      </Table.Td>
                      <Table.Td>
                        <Text c={outstanding > 0 ? 'red' : 'green'}>
                          <NumberFormatter value={outstanding} prefix="₹" thousandSeparator />
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={collectionRate >= 80 ? 'green' : collectionRate >= 50 ? 'yellow' : 'red'}
                          variant="light"
                        >
                          {collectionRate.toFixed(1)}%
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </Stack>
    );
  };

  return (
    <Container size="xl">
      <Card withBorder radius="md">
        <Card.Section withBorder inheritPadding py="md">
          <Group justify="space-between">
            <Title order={3}>Financial Reports</Title>
            <Group>
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
                onClick={() => exportReport('excel')}
              >
                Export Excel
              </Button>
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
                onClick={() => exportReport('pdf')}
              >
                Export PDF
              </Button>
              <Button
                variant="light"
                leftSection={<IconPrinter size={16} />}
                onClick={printReport}
              >
                Print
              </Button>
            </Group>
          </Group>
        </Card.Section>

        <Card.Section inheritPadding py="md">
          <Group mb="md">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(value) => setReportType(value || '')}
              data={[
                { value: 'collection_summary', label: 'Collection Summary' },
                { value: 'outstanding_fees', label: 'Outstanding Fees' },
                { value: 'fee_type_analysis', label: 'Fee Type Analysis' }
              ]}
              style={{ minWidth: 200 }}
            />            <DatePickerInput
              type="range"
              label="Date Range"
              value={dateRange}
              onChange={(value) => {
                if (Array.isArray(value) && value.length === 2) {
                  setDateRange([
                    value[0] ? new Date(value[0]) : null,
                    value[1] ? new Date(value[1]) : null
                  ]);
                }
              }}
              style={{ minWidth: 250 }}
            />
          </Group>

          <Tabs value={reportType} onChange={(value) => setReportType(value || '')}>
            <Tabs.List>
              <Tabs.Tab value="collection_summary" leftSection={<IconChartBar size={16} />}>
                Collection Summary
              </Tabs.Tab>
              <Tabs.Tab value="outstanding_fees" leftSection={<IconChartLine size={16} />}>
                Outstanding Fees
              </Tabs.Tab>
              <Tabs.Tab value="fee_type_analysis" leftSection={<IconChartPie size={16} />}>
                Fee Type Analysis
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="collection_summary" pt="md">
              {loading ? <Text>Loading...</Text> : renderCollectionSummary()}
            </Tabs.Panel>

            <Tabs.Panel value="outstanding_fees" pt="md">
              {loading ? <Text>Loading...</Text> : renderOutstandingFees()}
            </Tabs.Panel>

            <Tabs.Panel value="fee_type_analysis" pt="md">
              {loading ? <Text>Loading...</Text> : renderFeeTypeAnalysis()}
            </Tabs.Panel>
          </Tabs>
        </Card.Section>
      </Card>
    </Container>
  );
};

export default FinancialReports;
