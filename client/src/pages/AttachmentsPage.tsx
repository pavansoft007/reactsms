import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAcademicYear } from '../context/AcademicYearContext';

const AttachmentsPage: React.FC = () => {
  const { academicYear } = useAcademicYear();
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (academicYear) {
      axios.get(`/api/attachments?session_id=${academicYear.id}`)
        .then(res => setAttachments(res.data.attachments))
        .catch(() => setAttachments([]));
    }
  }, [academicYear]);

  return (
    <div>
      <h2>Attachments</h2>
      <ul>
        {attachments.map((a: any) => (
          <li key={a.id}>{a.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default AttachmentsPage;
