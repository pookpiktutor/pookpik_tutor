
        import { db } from './src/firebase_backend.js';
        import { collection, addDoc, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
        
        const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyYjh5-6frv-AytBYl1EnWB46Vh5_VCkVVRg6XsU4A-KUJoR8nFh46XZ-ffvbtwiZHhhA/exec";
        
        function logMsg(msg) {
            console.log(msg);
            document.getElementById('log').textContent += msg + '\n';
        }

        async function fetchFromGas(funcName, args = []) {
            try {
                const response = await fetch(WEB_APP_URL, {
                    method: "POST",
                    body: JSON.stringify({ functionName: funcName, arguments: args }),
                    headers: { "Content-Type": "text/plain;charset=utf-8" }
                });
                return await response.json();
            } catch (err) {
                logMsg(`Error fetching ${funcName}: ${err.message}`);
                return null;
            }
        }

        async function migrateUsers() {
            logMsg('Fetching Users...');
            const users = await fetchFromGas('getUsersDB');
            if (users && users.success) {
                const colRef = collection(db, "users");
                for (const u of users.data) {
                    await addDoc(colRef, {
                        username: u.Username,
                        password: u.Password,
                        role: u.Role,
                        nickname: u.Nickname || "",
                        fullName: u.FullName || "",
                        phone: u.Phone || "",
                        profilePic: u.ProfilePic || ""
                    });
                }
                logMsg(`Migrated ${users.data.length} users.`);
            }
        }

        async function migrateTeachers() {
            logMsg('Fetching Teachers...');
            const data = await fetchFromGas('getTeachersList');
            if (data && data.success) {
                const colRef = collection(db, "teachers");
                for (const u of data.data) {
                    await addDoc(colRef, {
                        nickname: u.Nickname,
                        fullName: u.FullName || "",
                        school: u.School || "",
                        phone: u.Phone || "",
                        subjects: u.Subjects || "",
                        bank: u.Bank || "",
                        accountNumber: u.AccountNumber || "",
                        compensation: u.Compensation || "",
                        type: u.Type || ""
                    });
                }
                logMsg(`Migrated ${data.data.length} teachers.`);
            }
        }

        async function migrateRooms() {
            logMsg('Fetching Rooms...');
            const data = await fetchFromGas('getRoomsDB');
            if (data && data.success) {
                const colRef = collection(db, "rooms");
                for (const u of data.data) {
                    await addDoc(colRef, {
                        roomName: u.RoomName,
                        properties: u.Properties || ""
                    });
                }
                logMsg(`Migrated ${data.data.length} rooms.`);
            }
        }

        async function migrateStudents() {
            logMsg('Fetching Students...');
            const data = await fetchFromGas('getStudentsList');
            if (data && data.success) {
                const colRef = collection(db, "students");
                for (const u of data.data) {
                    await addDoc(colRef, {
                        id: u.id || `MIG_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                        name: u.name || "",
                        nickname: u.nickname || "",
                        school: u.school || "",
                        phone: u.contact || "",
                        branchLearn: u.branchLearn || "",
                        branchPay: u.branchPay || "",
                        paymentMemo: u.paymentTimeNote || "",
                        extraMemo: u.extraNote || "",
                        paidAmount: parseFloat(u.paid) || 0,
                        tuitionFee: parseFloat(u.full) || 0,
                        balance: (parseFloat(u.full) || 0) - (parseFloat(u.paid) || 0),
                        paymentDate: u.paymentDate || "",
                        paymentChannel: u.paymentChannel || "",
                        receiver: u.staff || "",
                        roundLearn: u.round || "",
                        grade: u.grade || "",
                        subroom: u.classSection || "",
                        lineProfile: u.lineName || "",
                        lineId: u.lineId || "",
                        carriedOverFee: parseFloat(u.carriedForwardFee) || 0,
                        studyHours: u.classHours || "",
                        remainingHours: u.classHoursLeft || "",
                        classType: u.classType || "",
                        checked: u.isChecked ? "1" : ""
                    });
                }
                logMsg(`Migrated ${data.data.length} students.`);
            }
        }

        async function migrateClassLogs() {
            logMsg('Fetching ClassLogs...');
            const data = await fetchFromGas('getDailyGridData');
            if (data && data.success) {
                const colRef = collection(db, "classLogs");
                for (const u of data.data) {
                    await addDoc(colRef, {
                        date: u.date || "",
                        startTime: u.timeStart || "",
                        endTime: u.timeEnd || "",
                        subject: u.subject || "",
                        mainTeacher: u.teacherRegular || "",
                        subTeacher: u.teacherSub || "",
                        roomBranchInfo: u.roomBranchInfo || "",
                        memo: u.memo || "",
                        presentCount: parseInt(u.presentCount) || 0,
                        onlineCount: parseInt(u.onlineCount) || 0,
                        leaveCount: parseInt(u.leaveCount) || 0,
                        absentCount: parseInt(u.absentCount) || 0,
                        makeUpCount: parseInt(u.makeUpCount) || 0,
                        extraCount: parseInt(u.extraCount) || 0,
                        hours: parseFloat(u.hours) || 0
                    });
                }
                logMsg(`Migrated ${data.data.length} class logs.`);
            }
        }

        async function migrateEvaluations() {
            logMsg('Fetching Evaluations...');
            const data = await fetchFromGas('getEvaluationsList');
            if (data && data.success && data.data) {
                const colRef = collection(db, "evaluations");
                for (const u of data.data) {
                    await addDoc(colRef, {
                        studentId: u.StudentId || "",
                        studentName: u.StudentName || "",
                        subject: u.Subject || "",
                        evalDate: u.EvalDate || "",
                        score: u.Score || "",
                        comments: u.Comments || ""
                    });
                }
                logMsg(`Migrated ${data.data.length} evaluations.`);
            }
        }

        async function startMigration() {
            try {
                await migrateUsers();
                await migrateTeachers();
                await migrateRooms();
                await migrateStudents();
                await migrateClassLogs();
                await migrateEvaluations();
                logMsg('\nMigration Completed Successfully!');
            } catch (err) {
                logMsg(`\nMigration Failed: ${err.message}`);
            }
        }

        startMigration();
    