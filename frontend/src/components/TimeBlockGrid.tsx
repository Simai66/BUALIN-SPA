import { Card } from 'react-bootstrap';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface TimeBlockGridProps {
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
  durationMinutes?: number;
  hourlyOnly?: boolean;
}

export const TimeBlockGrid = ({ slots, onSelectSlot, hourlyOnly = false }: TimeBlockGridProps) => {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const displaySlots = hourlyOnly
    ? slots.filter((s) => new Date(s.start).getMinutes() === 0)
    : slots;

  return (
    <div>
      <h5 className="mb-3">เลือกช่วงเวลา</h5>
      <div className="row g-3">
        {displaySlots.map((slot, index) => (
          <div key={index} className="col-6 col-md-4 col-lg-3">
            <Card
              className={`text-center h-100 slot-card ${slot.available ? 'available' : 'unavailable'}`}
              onClick={() => slot.available && onSelectSlot(slot)}
            >
              <Card.Body>
                <div className="slot-time fw-bold">{formatTime(slot.start)}</div>
                <div className="slot-time-sub small">- {formatTime(slot.end)}</div>
                <div className="mt-3">
                  {slot.available ? (
                    <span className="status-badge available">ว่าง</span>
                  ) : (
                    <span className="status-badge unavailable">ไม่ว่าง</span>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      <style>{`
        .slot-card { cursor: pointer; }
        .slot-card.unavailable { cursor: not-allowed; }
      `}</style>
    </div>
  );
};
