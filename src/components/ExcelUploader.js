import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const ExcelUploader = ({ onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Molimo odaberite Excel fajl (.xlsx ili .xls)');
      return;
    }

    setError(null);
    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const data = await readExcelFile(file);
      onUpload(data);
      setIsProcessing(false);
    } catch (err) {
      setError('Greška pri čitanju Excel fajla: ' + err.message);
      setIsProcessing(false);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          resolve({
            fileName: file.name,
            sheetName,
            data: jsonData,
            workbook
          });
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error('Greška pri čitanju fajla'));
      reader.readAsArrayBuffer(file);
    });
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className={`upload-area ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {!uploadedFile ? (
          <>
            <Upload size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
            <h3>Prevucite Excel fajl ovde ili kliknite za odabir</h3>
            <p>Podržani formati: .xlsx, .xls</p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="#dc2626" style={{ marginBottom: '1rem' }} />
            <h3>Fajl uspešno učitan!</h3>
            <p>{uploadedFile.name}</p>
            <button 
              className="btn btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              style={{ marginTop: '1rem' }}
            >
              <X size={20} />
              Ukloni Fajl
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem' 
        }}>
          <strong>Greška:</strong> {error}
        </div>
      )}

      {isProcessing && (
        <div style={{ 
          background: '#eff6ff', 
          border: '1px solid #bfdbfe', 
          color: '#1d4ed8', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div className="spinner" style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid #bfdbfe', 
              borderTop: '2px solid #1d4ed8', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            Obrađujem Excel fajl...
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExcelUploader;
