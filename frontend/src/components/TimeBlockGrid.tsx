import { Card } from 'react-bootstrap';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface TimeBlockGridProps {
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
  durationMinutes: number;
}

export const TimeBlockGrid = ({ slots, onSelectSlot }: TimeBlockGridProps) => {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h5 className="mb-3">เลือกช่วงเวลา</h5>
      <div className="row g-3">
        {slots.map((slot, index) => (
          <div key={index} className="col-6 col-md-4 col-lg-3">
            <Card
              className={`text-center h-100 ${
                slot.available
                  ? 'border-success bg-light cursor-pointer hover-shadow'
                  : 'border-secondary bg-secondary text-white'
              }`}
              style={{
                cursor: slot.available ? 'pointer' : 'not-allowed',
                opacity: slot.available ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
              onClick={() => slot.available && onSelectSlot(slot)}
            >
              <Card.Body>
                <div className="fw-bold">{formatTime(slot.start)}</div>
                <div className="small">- {formatTime(slot.end)}</div>
                <div className="mt-2 small">
                  {slot.available ? (
                    <span className="badge bg-success">ว่าง</span>
                  ) : (
                    <span className="badge bg-secondary">ไม่ว่าง</span>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
