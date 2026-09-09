import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

export default function AddTerm({ onBack, centerCode }) {
  const [termName, setTermName] = useState("");
  const [loading, setLoading] = useState(false);

  const server = "https://krishbackend-production-9603.up.railway.app";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termName.trim()) {
      alert("Please enter a term name.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${server}/add-current-term-chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          center_code: centerCode,
          term_name: termName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add term.");
      }

      alert("Term added successfully.");

      setTermName("");
    } catch (err) {
      console.error(err);
      alert("Unable to add term.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Card elevation={3}>
        <CardContent>

          <Typography variant="h5" gutterBottom>
            Add Academic Term
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Create a new academic term for your centre.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              maxWidth: 500,
            }}
          >
            <TextField
              label="Term Name"
              placeholder="Example: Term 1 2027"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Term"}
            </Button>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}