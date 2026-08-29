const fs = require('fs');
let code = fs.readFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', 'utf8');

// Fix 1: Ensure loadMonthlyGrid calls updateMonthDisplay and updateDowTabsActive at the start
code = code.replace(
  `function loadMonthlyGrid(isSilent = false) {\n  if (!isSilent) {\n    setLoading(true`,
  `function loadMonthlyGrid(isSilent = false) {\n  updateMonthDisplay();\n  updateDowTabsActive();\n  if (!isSilent) {\n    setLoading(true`
);

// Fix 2: Modify renderMonthlyGrid to add a virtual online room if none exists for the branch,
// and make sure it renders even if rooms are empty just in case.
const renderMonthlySearch = `  const filteredRooms = (data.rooms || []).filter(room => {
    const roomBranchClean = (room.branch || '').replace(/\\s+/g, '');
    return roomBranchClean === branchFilterShort;
  });`;

const renderMonthlyReplace = `  const filteredRooms = (data.rooms || []).filter(room => {
    const roomBranchClean = (room.branch || '').replace(/\\s+/g, '');
    return roomBranchClean === branchFilterShort;
  });
  
  // Add a virtual "ออนไลน์" room for the current branch so online students can be displayed
  const hasOnlineRoom = filteredRooms.some(r => (r.roomName || '').toLowerCase().includes('ออนไลน์') || (r.branch || '').toLowerCase().includes('ออนไลน์'));
  if (!hasOnlineRoom) {
    filteredRooms.push({
      branch: branchFilterShort,
      roomName: 'ออนไลน์ ' + branchFilterShort,
      ipad: '',
      zoom: ''
    });
  }`;

if (code.includes(renderMonthlySearch)) {
  code = code.replace(renderMonthlySearch, renderMonthlyReplace);
}

// Fix 3: In matchRoomAndBranch, if the room name is "ออนไลน์ สาขาX", cleanRN contains "ออนไลน์" and "สาขาX".
// We need to ensure that the online room ONLY matches online classes assigned to THIS branch!
const matchRoomSearch = `  if (cleanRN.includes('ออนไลน์') || cleanRN.includes('online')) {
    if (!(cleanRB.includes('ออนไลน์') || cleanRB.includes('online'))) return false;
    
    let rbBranch = '';
    if (cleanRB.includes('สาขา1') || cleanRB.includes('สาขา 1') || cleanRB.includes('ออนไลน์1') || cleanRB.includes('ออน1') || cleanRB.includes(' 1')) rbBranch = 'สาขา1';
    else if (cleanRB.includes('สาขา2') || cleanRB.includes('สาขา 2') || cleanRB.includes('ออนไลน์2') || cleanRB.includes('ออน2') || cleanRB.includes(' 2')) rbBranch = 'สาขา2';
    else if (cleanRB.includes('สาขา3') || cleanRB.includes('สาขา 3') || cleanRB.includes('ออนไลน์3') || cleanRB.includes('ออน3') || cleanRB.includes(' 3')) rbBranch = 'สาขา3';
    else rbBranch = 'สาขา1';
    
    let bBranch = '';
    const normB = branchName.toLowerCase().replace(/\\s+/g, '');
    if (normB.includes('สาขา1')) bBranch = 'สาขา1';
    else if (normB.includes('สาขา2')) bBranch = 'สาขา2';
    else if (normB.includes('สาขา3')) bBranch = 'สาขา3';
    else bBranch = 'สาขา1';
    
    return rbBranch === bBranch;
  }`;

const matchRoomReplace = `  if (cleanRN.includes('ออนไลน์') || cleanRN.includes('online')) {
    if (!(cleanRB.includes('ออนไลน์') || cleanRB.includes('online'))) return false;
    
    let rbBranch = '';
    if (cleanRB.includes('สาขา1') || cleanRB.includes('สาขา 1') || cleanRB.includes('ออนไลน์1') || cleanRB.includes('ออน1') || cleanRB.includes(' 1')) rbBranch = 'สาขา1';
    else if (cleanRB.includes('สาขา2') || cleanRB.includes('สาขา 2') || cleanRB.includes('ออนไลน์2') || cleanRB.includes('ออน2') || cleanRB.includes(' 2')) rbBranch = 'สาขา2';
    else if (cleanRB.includes('สาขา3') || cleanRB.includes('สาขา 3') || cleanRB.includes('ออนไลน์3') || cleanRB.includes('ออน3') || cleanRB.includes(' 3')) rbBranch = 'สาขา3';
    else rbBranch = 'สาขา1';
    
    // For our virtual room, roomName is "ออนไลน์ สาขาX" and branchName is "สาขาX"
    let bBranch = '';
    const normB = (branchName + ' ' + roomName).toLowerCase().replace(/\\s+/g, '');
    if (normB.includes('สาขา1')) bBranch = 'สาขา1';
    else if (normB.includes('สาขา2')) bBranch = 'สาขา2';
    else if (normB.includes('สาขา3')) bBranch = 'สาขา3';
    else bBranch = 'สาขา1';
    
    return rbBranch === bBranch;
  }`;

if (code.includes(matchRoomSearch)) {
  code = code.replace(matchRoomSearch, matchRoomReplace);
}

fs.writeFileSync('g:/My Drive/0.งานสถาบัน/data_PookPik_Tutor/JavaScript.html', code);
console.log('Fixed loadMonthlyGrid initialization and online rooms.');
