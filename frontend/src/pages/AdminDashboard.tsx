import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form } from 'react-bootstrap';
import { adminAPI } from '../api/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (params?: any) => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard(params);
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchDashboard(dateRange);
  };

  const handleExportPDF = async () => {
    try {
      const response = await adminAPI.exportPDF(dateRange);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export PDF failed:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await adminAPI.exportExcel(dateRange);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export Excel failed:', error);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  const kpis = dashboard?.kpis || {};
  const charts = dashboard?.charts || {};
  const tables = dashboard?.tables || {};

  // Daily Revenue Chart
  const dailyRevenueData = {
    labels: (charts.dailyRevenue || []).map((d: any) => d.date),
    datasets: [
      {
  label: 'Daily Revenue (THB)',
        data: (charts.dailyRevenue || []).map((d: any) => d.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Hourly Revenue Chart
  const hourlyRevenueData = {
    labels: (charts.hourlyRevenue || []).map((d: any) => `${d.hour}:00`),
    datasets: [
      {
  label: 'Hourly Revenue (THB)',
        data: (charts.hourlyRevenue || []).map((d: any) => d.revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  // Bookings by Service Chart
  const bookingsByServiceData = {
    labels: (charts.bookingsByService || []).map((d: any) => d.service_name),
    datasets: [
      {
  label: 'Number of Bookings',
        data: (charts.bookingsByService || []).map((d: any) => d.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  // Therapist Hours Chart
  const therapistHoursData = {
    labels: (charts.therapistHours || []).map((d: any) => d.name),
    datasets: [
      {
  label: 'Working Hours',
        data: (charts.therapistHours || []).map((d: any) => d.hours),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      },
    ],
  };

  return (
    <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col>
            <h2>Admin Dashboard</h2>
          </Col>
          <Col md="auto">
            <Button variant="danger" onClick={handleExportPDF} className="me-2">
              Export PDF
            </Button>
            <Button variant="success" onClick={handleExportExcel}>
              Export Excel
            </Button>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col md={3}>
            <Form.Group>
  <Form.Label>Start</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
  <Form.Label>End</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button onClick={handleFilter} className="w-100">
  Filter
            </Button>
          </Col>
        </Row>

        {/* KPI Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card bg="primary" text="white">
              <Card.Body>
  <Card.Title>Today's Revenue</Card.Title>
                <h3>{Number(kpis.todayRevenue || 0).toLocaleString()} ฿</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card bg="success" text="white">
              <Card.Body>
  <Card.Title>Today's Bookings</Card.Title>
                <h3>
                  {kpis.todayConfirmedCount || 0} / {kpis.todayBookingsCount || 0}
                </h3>
  <small>Confirmed / Total</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card bg="info" text="white">
              <Card.Body>
  <Card.Title>This Month's Revenue</Card.Title>
                <h3>{Number(kpis.mtdRevenue || 0).toLocaleString()} ฿</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card bg="warning" text="white">
              <Card.Body>
  <Card.Title>Working Hours This Week</Card.Title>
  <h3>{Math.round(kpis.weekTotalHours || 0)} hrs</h3>
  <small>Average {Math.round(kpis.weekAvgHoursPerTherapist || 0)} hrs/person</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
  <Card.Title>Daily Revenue (Last 30 Days)</Card.Title>
                <Line data={dailyRevenueData} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
  <Card.Title>Hourly Revenue (Today)</Card.Title>
                <Bar data={hourlyRevenueData} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
  <Card.Title>Bookings by Service</Card.Title>
                <Doughnut data={bookingsByServiceData} />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
  <Card.Title>Working Hours per Therapist (This Week)</Card.Title>
                <Bar data={therapistHoursData} options={{ indexAxis: 'y' }} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tables */}
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Body>
  <Card.Title>Top 5 Revenue Services (Last 30 Days)</Card.Title>
                <Table striped bordered hover>
                  <thead>
                    <tr>
  <th>Service</th>
  <th>Revenue</th>
  <th>Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tables.topServices || []).map((service: any, idx: number) => (
                      <tr key={idx}>
                        <td>{service.service_name}</td>
                        <td>{Number(service.revenue).toLocaleString()} ฿</td>
                        <td>{service.bookings}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
  <Card.Title>Pending Bookings (Latest 10)</Card.Title>
                <Table striped bordered hover>
                  <thead>
                    <tr>
  <th>Customer</th>
  <th>Service</th>
  <th>Date &amp; Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tables.pendingBookings || []).map((booking: any) => (
                      <tr key={booking.id}>
                        <td>{booking.customer_name}</td>
                        <td>{booking.service_name}</td>
                        <td>{format(new Date(booking.booking_datetime), 'dd/MM/yyyy HH:mm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
  );
};
