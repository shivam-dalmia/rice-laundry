import { firestore } from "../firebase_setup/firebase";
import { doc, setDoc } from "@firebase/firestore";

// Simple in-memory store to persist mock data during the session if DB fails
const mockStore = {};

export const generateMockData = (college) => {
    // If we already have data for this college in memory, return it to persist state
    if (mockStore[college]) {
        return mockStore[college];
    }

    // Generate 10 Washers
    const washers = Array.from({ length: 10 }, (_, i) => ({
        id: `mock-${college}-washer-${i + 1}`,
        type: 'washer',
        number: `${i + 1}`,
        status: 0, // 0 = Available, 1 = In Use, 2 = Broken
        college: college
    }));

    // Generate 10 Dryers
    const dryers = Array.from({ length: 10 }, (_, i) => ({
        id: `mock-${college}-dryer-${i + 1}`,
        type: 'dryer',
        number: `${i + 1}`,
        status: 0,
        college: college
    }));

    // Generate 10 Bins
    const bins = Array.from({ length: 10 }, (_, i) => ({
        id: `mock-${college}-bin-${i + 1}`,
        type: 'bin',
        number: `${i + 1}`,
        status: 0, // 0 = Empty, 1 = Full
        college: college
    }));

    const data = { washers, dryers, bins };
    mockStore[college] = data; // Save to store
    return data;
};

// Helper to update mock store manually if we are in fallback mode
export const updateMockStore = (college, type, id, newStatus) => {
    if (!mockStore[college]) return; // Should not happen if generated already

    const listName = type === 'washer' ? 'washers' : (type === 'dryer' ? 'dryers' : 'bins');
    mockStore[college][listName] = mockStore[college][listName].map(item =>
        item.id === id ? { ...item, status: newStatus } : item
    );
};

export const seedFirestore = async (college) => {
    const data = generateMockData(college);
    const machines = [...data.washers, ...data.dryers, ...data.bins];

    console.log(`Seeding Firestore for ${college}...`);

    // We use Promise.all to do this concurrently
    await Promise.all(machines.map(async (machine) => {
        // Use the deterministic ID so we don't create duplicates on re-seed attempts if partially failed
        const docRef = doc(firestore, "machines", machine.id);
        await setDoc(docRef, machine);
    }));

    console.log(`Seeding complete for ${college}`);
};
