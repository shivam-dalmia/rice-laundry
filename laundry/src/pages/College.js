import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { queryFirestoreCollectionByCollege } from '../handle/handlequery';
import { seedFirestore, generateMockData, updateMockStore } from '../handle/mockData';
import { updateMachineStatus } from '../handle/handleupdate';
import './college.css';

export default function College() {
    const { college } = useParams();
    const collegeName = college ? college.charAt(0).toUpperCase() + college.slice(1) : "";

    // State for machines
    const [washers, setWashers] = useState([]);
    const [dryers, setDryers] = useState([]);
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [modalAction, setModalAction] = useState(null);

    const fetchData = async () => {
        try {
            if (!college) return;
            // Don't set loading to true on every fetch to avoid flickering on updates, 
            // only on initial mount/seed
            if (washers.length === 0) setLoading(true);

            const results = await queryFirestoreCollectionByCollege(college.toLowerCase());

            // Check if we need to seed (if all are empty)
            if (results[0].length === 0 && results[1].length === 0 && results[2].length === 0) {
                console.log("No data found, seeding...");
                await seedFirestore(college.toLowerCase());
                // Re-fetch after seeding
                const newResults = await queryFirestoreCollectionByCollege(college.toLowerCase());
                setWashers(newResults[0]);
                setDryers(newResults[1]);
                setBins(newResults[2]);
            } else {
                setWashers(results[0]);
                setDryers(results[1]);
                setBins(results[2]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Fallback to offline mock data if Firestore fails (e.g., permissions or network)
            console.warn("Falling back to local mock data.");
            const mockData = generateMockData(college.toLowerCase());
            setWashers(mockData.washers);
            setDryers(mockData.dryers);
            setBins(mockData.bins);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [college]);

    // --- LOGIC HANDLERS ---

    const handleMachineClick = (machine, type) => {
        setSelectedMachine({ ...machine, type });

        // Logic branching based on machine status
        if (type === 'washer') {
            if (machine.status === 0) setModalAction('start_washer');
            else if (machine.status === 1) setModalAction('in_use_washer'); // Changed to generic 'in_use' to offer generic options + move
            else setModalAction('broken_machine');
        } else if (type === 'dryer') {
            if (machine.status === 0) setModalAction('start_dryer');
            else if (machine.status === 1) setModalAction('in_use_dryer');
            else setModalAction('broken_machine');
        } else if (type === 'bin') {
            if (machine.status === 1) setModalAction('empty_bin');
            else setModalAction('info_bin');
        }
    };

    // Helper to update both local state (optimistic) and Firestore
    const updateStatus = async (type, id, newStatus) => {
        // Optimistic Update
        const updater = type === 'washer' ? setWashers : (type === 'dryer' ? setDryers : setBins);
        updater(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));

        // Firestore Update
        try {
            await updateMachineStatus(id, newStatus);
        } catch (error) {
            console.warn("Failed to update firestore, using mock store fallback...");
            updateMockStore(college.toLowerCase(), type, id, newStatus);
            // No need to rollback or re-fetch aggressively if we are comfortable with mock data
        }
    };

    const handleStartWasher = () => {
        updateStatus('washer', selectedMachine.id, 1);
        closeModal();
    };

    const handleStopLoad = () => {
        updateStatus(selectedMachine.type, selectedMachine.id, 0); // Reset to available
        closeModal();
    };

    const handleMoveToDryer = (targetDryerId) => {
        updateStatus('washer', selectedMachine.id, 0); // Empty washer
        updateStatus('dryer', targetDryerId, 1);       // Fill dryer
        closeModal();
    };

    const handleMoveToBin = (targetBinId) => {
        updateStatus('dryer', selectedMachine.id, 0); // Empty dryer
        updateStatus('bin', targetBinId, 1);          // Fill bin
        closeModal();
    };

    const handleEmptyBin = () => {
        updateStatus('bin', selectedMachine.id, 0);
        closeModal();
    };

    const handleReportBroken = () => {
        updateStatus(selectedMachine.type, selectedMachine.id, 2);
        closeModal();
    };

    const handleReportFixed = () => {
        updateStatus(selectedMachine.type, selectedMachine.id, 0); // Reset to available
        closeModal();
    };

    const closeModal = () => {
        setSelectedMachine(null);
        setModalAction(null);
    };


    if (!college) return <div className="loading-container">Invalid College</div>;

    const getStatusClass = (status) => {
        if (status === 0) return 'status-available';
        if (status === 1) return 'status-busy';
        if (status === 2) return 'status-broken';
        return 'status-other';
    };

    return (
        <div className="college-container">
            <header className="college-header">
                <div className="header-left">
                    <Link to="/">
                        <img className="college-logo-small" src="../../logo.jpg" alt="Logo" />
                    </Link>
                    <h2 className="college-title">{collegeName}'s Laundry</h2>
                </div>
            </header>

            <div className="content-body">
                {loading ? (
                    <div className="loading-container">Loading Laundry Room...</div>
                ) : (
                    <>
                        <h3 className="section-title">Washers</h3>
                        <div className="machines-grid">
                            {washers.map((result) => (
                                <div
                                    key={result.id}
                                    className="machine-card"
                                    onClick={() => handleMachineClick(result, 'washer')}
                                >
                                    <div className={`status-dot ${getStatusClass(result.status)}`}></div>
                                    <div className="machine-icon">🧺</div>
                                    <span className="machine-number">{result.number}</span>
                                    <span className="machine-type">Washer</span>
                                </div>
                            ))}
                        </div>

                        <h3 className="section-title">Dryers</h3>
                        <div className="machines-grid">
                            {dryers.map((result) => (
                                <div
                                    key={result.id}
                                    className="machine-card"
                                    onClick={() => handleMachineClick(result, 'dryer')}
                                >
                                    <div className={`status-dot ${getStatusClass(result.status)}`}></div>
                                    <div className="machine-icon">🔥</div>
                                    <span className="machine-number">{result.number}</span>
                                    <span className="machine-type">Dryer</span>
                                </div>
                            ))}
                        </div>

                        <h3 className="section-title">Bins</h3>
                        <div className="machines-grid">
                            {bins.map((result) => (
                                <div
                                    key={result.id}
                                    className="machine-card"
                                    onClick={() => handleMachineClick(result, 'bin')}
                                >
                                    <div className={`status-dot ${getStatusClass(result.status)}`}></div>
                                    <div className="machine-icon">🗑️</div>
                                    <span className="machine-number">{result.number}</span>
                                    <span className="machine-type">Bin</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {selectedMachine && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Machine {selectedMachine.number}</h3>

                        {/* START WASHER */}
                        {modalAction === 'start_washer' && (
                            <>
                                <p>Start this washer?</p>
                                <button className="modal-btn btn-primary" onClick={handleStartWasher}>Start Load</button>
                                <button className="modal-btn btn-danger" onClick={handleReportBroken}>Report Broken</button>
                            </>
                        )}

                        {/* IN USE WASHER */}
                        {modalAction === 'in_use_washer' && (
                            <>
                                <p>Washer is running.</p>
                                <p className="text-small">Move clothes to dryer?</p>
                                <div className="modal-grid">
                                    {dryers.filter(d => d.status === 0).map(d => (
                                        <button key={d.id} className="modal-btn-choice" onClick={() => handleMoveToDryer(d.id)}>
                                            Dryer {d.number}
                                        </button>
                                    ))}
                                    {dryers.filter(d => d.status === 0).length === 0 && <p>No available dryers!</p>}
                                </div>
                                <div className="spacer"></div>
                                <button className="modal-btn btn-danger" onClick={handleStopLoad}>Stop Load</button>
                                <button className="modal-btn btn-danger" onClick={handleReportBroken}>Report Broken</button>
                            </>
                        )}

                        {/* START DRYER */}
                        {modalAction === 'start_dryer' && (
                            <>
                                <p>Dryers are usually started by moving clothes from a washer.</p>
                                <button className="modal-btn btn-danger" onClick={handleReportBroken}>Report Broken</button>
                            </>
                        )}

                        {/* IN USE DRYER */}
                        {modalAction === 'in_use_dryer' && (
                            <>
                                <p>Dryer is running.</p>
                                <p className="text-small">Move clothes to bin?</p>
                                <div className="modal-grid">
                                    {bins.filter(b => b.status === 0).map(b => (
                                        <button key={b.id} className="modal-btn-choice" onClick={() => handleMoveToBin(b.id)}>
                                            Bin {b.number}
                                        </button>
                                    ))}
                                    {bins.filter(b => b.status === 0).length === 0 && <p>No available bins!</p>}
                                </div>
                                <div className="spacer"></div>
                                <button className="modal-btn btn-danger" onClick={handleStopLoad}>Stop Load</button>
                                <button className="modal-btn btn-danger" onClick={handleReportBroken}>Report Broken</button>
                            </>
                        )}

                        {/* EMPTY BIN */}
                        {modalAction === 'empty_bin' && (
                            <>
                                <p>Empty this bin?</p>
                                <button className="modal-btn btn-primary" onClick={handleEmptyBin}>Empty Bin</button>
                            </>
                        )}

                        {/* INFO BIN */}
                        {modalAction === 'info_bin' && (
                            <p>This bin is empty and ready for use.</p>
                        )}

                        {/* BROKEN */}
                        {modalAction === 'broken_machine' && (
                            <>
                                <p>This machine is currently broken.</p>
                                <button className="modal-btn btn-primary" onClick={handleReportFixed}>Report Fixed</button>
                            </>
                        )}

                        <button className="modal-close" onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
