# Tournament Brackets API Documentation

This document outlines the required API endpoints for the multi-round tournament bracket system.

## Tournament Bracket Structure

The tournament follows this format:
- **100 teams** register initially
- **4 rounds** (Round 1, 2, 3, 4) with 25 teams each
- **Top 4 teams** from each round qualify for the next
- **16 teams** compete in the finals
- **Entry fees** required for each round

## Required API Endpoints

### 1. Get Tournament Brackets
```
GET /api/tournaments/:tournamentId/brackets
GET /api/tournaments/slug/:slug/brackets
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tournamentId": "tournament_id",
    "totalTeams": 100,
    "currentRound": 1,
    "rounds": {
      "1": {
        "status": "pending|active|completed",
        "teams": [
          {
            "teamId": "team_id",
            "teamName": "Team Name",
            "status": "registered|qualified|eliminated",
            "paymentStatus": "pending|paid",
            "score": 0,
            "position": null,
            "groupId": 1
          }
        ],
        "groups": [
          {
            "groupId": 1,
            "teams": ["team_id1", "team_id2"],
            "status": "pending|active|completed"
          }
        ]
      },
      "2": { /* Same structure */ },
      "3": { /* Same structure */ },
      "4": { /* Same structure */ },
      "final": {
        "status": "pending|active|completed",
        "teams": [/* 16 qualified teams */],
        "groups": [/* Single group or multiple groups */]
      }
    },
    "payments": {
      "round1": { "teamId": { "amount": 100, "status": "paid", "timestamp": "ISO_DATE" } },
      "round2": { "teamId": { "amount": 200, "status": "paid", "timestamp": "ISO_DATE" } },
      "round3": { "teamId": { "amount": 300, "status": "paid", "timestamp": "ISO_DATE" } },
      "round4": { "teamId": { "amount": 500, "status": "paid", "timestamp": "ISO_DATE" } }
    },
    "results": {
      "round1": { "groupId": [{ "teamId": "team_id", "position": 1, "score": 100 }] },
      "round2": { /* Same structure */ },
      "round3": { /* Same structure */ },
      "round4": { /* Same structure */ },
      "final": { "winner": "team_id", "rankings": [/* Final rankings */] }
    }
  }
}
```

### 2. Initialize Tournament Brackets
```
POST /api/tournaments/:tournamentId/brackets
```

**Request Body:**
```json
{
  "tournamentId": "tournament_id",
  "totalTeams": 100,
  "currentRound": 1,
  "rounds": {
    "1": {
      "status": "pending",
      "teams": [/* All registered teams */],
      "groups": [/* 4 groups of 25 teams each */]
    },
    "2": { "status": "pending", "teams": [], "groups": [] },
    "3": { "status": "pending", "teams": [], "groups": [] },
    "4": { "status": "pending", "teams": [], "groups": [] },
    "final": { "status": "pending", "teams": [], "groups": [] }
  },
  "payments": {},
  "results": {}
}
```

### 3. Start Round
```
POST /api/tournaments/:tournamentId/brackets/round/:roundKey/start
```

**Request Body:**
```json
{
  "roundKey": "1|2|3|4|final"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Round started successfully",
  "data": {
    "roundKey": "1",
    "status": "active",
    "startTime": "ISO_DATE"
  }
}
```

### 4. Complete Round
```
POST /api/tournaments/:tournamentId/brackets/round/:roundKey/complete
```

**Request Body:**
```json
{
  "roundKey": "1|2|3|4|final",
  "results": [
    {
      "groupId": 1,
      "rankings": [
        { "teamId": "team_id", "position": 1, "score": 100 },
        { "teamId": "team_id", "position": 2, "score": 95 }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Round completed successfully",
  "data": {
    "completedRound": "1",
    "qualifiedTeams": ["team_id1", "team_id2", "team_id3", "team_id4"],
    "nextRound": "2",
    "updatedBrackets": {/* Full brackets object */}
  }
}
```

### 5. Record Payment
```
POST /api/tournaments/:tournamentId/brackets/payment
```

**Request Body:**
```json
{
  "teamId": "team_id",
  "roundKey": "1|2|3|4",
  "amount": 100,
  "status": "paid|pending|failed",
  "paymentMethod": "card|upi|bank_transfer",
  "transactionId": "txn_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "teamId": "team_id",
    "roundKey": "1",
    "amount": 100,
    "status": "paid",
    "timestamp": "ISO_DATE"
  }
}
```

### 6. Update Team Status
```
PATCH /api/tournaments/:tournamentId/brackets/team/:teamId
```

**Request Body:**
```json
{
  "roundKey": "1|2|3|4|final",
  "status": "registered|qualified|eliminated",
  "score": 100,
  "position": 1,
  "paymentStatus": "pending|paid"
}
```

### 7. Get Payment Summary
```
GET /api/tournaments/:tournamentId/brackets/payments
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCollected": 50000,
    "byRound": {
      "round1": { "collected": 10000, "pending": 2500, "teams": 100 },
      "round2": { "collected": 8000, "pending": 0, "teams": 40 },
      "round3": { "collected": 4800, "pending": 0, "teams": 16 },
      "round4": { "collected": 2000, "pending": 0, "teams": 4 }
    },
    "pendingPayments": [
      { "teamId": "team_id", "teamName": "Team Name", "roundKey": "1", "amount": 100 }
    ]
  }
}
```

## Round Configuration

```javascript
const ROUND_CONFIG = {
  1: { name: 'Round 1', teamsPerGroup: 25, qualifyingTeams: 4, entryFee: 100 },
  2: { name: 'Round 2', teamsPerGroup: 25, qualifyingTeams: 4, entryFee: 200 },
  3: { name: 'Round 3', teamsPerGroup: 25, qualifyingTeams: 4, entryFee: 300 },
  4: { name: 'Round 4', teamsPerGroup: 25, qualifyingTeams: 4, entryFee: 500 },
  final: { name: 'Finals', teamsPerGroup: 16, qualifyingTeams: 1, entryFee: 0 }
};
```

## Database Schema

### Tournament Brackets Collection
```javascript
{
  _id: ObjectId,
  tournamentId: ObjectId,
  totalTeams: Number,
  currentRound: String, // "1", "2", "3", "4", "final"
  rounds: {
    "1": {
      status: String, // "pending", "active", "completed"
      teams: [{
        teamId: ObjectId,
        teamName: String,
        status: String, // "registered", "qualified", "eliminated"
        paymentStatus: String, // "pending", "paid"
        score: Number,
        position: Number,
        groupId: Number
      }],
      groups: [{
        groupId: Number,
        teams: [ObjectId],
        status: String
      }]
    },
    // ... other rounds
  },
  payments: {
    "round1": {
      "teamId": {
        amount: Number,
        status: String,
        timestamp: Date,
        transactionId: String
      }
    }
  },
  results: {
    "round1": {
      "groupId": [{
        teamId: ObjectId,
        position: Number,
        score: Number
      }]
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Business Logic

### Round Progression
1. **Round 1**: 100 teams → 4 groups of 25 → Top 4 from each group = 16 teams
2. **Round 2**: 16 teams → 4 groups of 4 → Top 4 from each group = 16 teams (or different grouping)
3. **Round 3**: 16 teams → 4 groups of 4 → Top 4 from each group = 16 teams
4. **Round 4**: 16 teams → 4 groups of 4 → Top 4 from each group = 16 teams
5. **Finals**: 16 teams → Single elimination or group play → 1 winner

### Payment Flow
1. Teams must pay entry fee before participating in each round
2. Payment verification required before round starts
3. Unpaid teams are automatically eliminated
4. Refund policy for eliminated teams (if applicable)

### Team Status Flow
```
registered → paid → active → (qualified|eliminated)
```

## Error Handling

All endpoints should return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid data)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (e.g., round already started)
- `500`: Internal Server Error

## Security Considerations

1. **Authentication**: All endpoints require admin authentication
2. **Authorization**: Only tournament organizers can manage brackets
3. **Payment Verification**: Implement proper payment verification
4. **Data Validation**: Validate all input data
5. **Rate Limiting**: Implement rate limiting for payment endpoints
6. **Audit Trail**: Log all bracket modifications

## Frontend Integration

The frontend will:
1. Display tournament brackets in a visual format
2. Allow admins to manage payments and team progression
3. Show real-time updates of tournament status
4. Handle payment confirmations
5. Generate reports and analytics

This system provides a complete tournament management solution with proper payment tracking, team progression, and administrative controls.