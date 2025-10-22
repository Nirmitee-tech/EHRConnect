import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.CLAIM_MD_ACCOUNT_KEY || '24995_*n0kREh@vAxWKyfeSHT4aWs6';

    const response = await axios.post(
      'https://svc.claim.md/services/payerlist/',
      `AccountKey=${encodeURIComponent(apiKey)}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 60000,
      }
    );

    // Parse and format payer data
    const payers = response.data?.PayerList || [];

    // Format for easier consumption
    const formattedPayers = payers.map((payer: any) => ({
      payerId: payer.PayerId,
      payerName: payer.PayerName,
      services: payer.Services || [],
      electronicPayerId: payer.ElectronicPayerId,
      phone: payer.Phone,
      address: payer.Address
    }));

    return NextResponse.json({
      success: true,
      payers: formattedPayers,
      total: formattedPayers.length
    });
  } catch (error: any) {
    console.error('Error fetching payers:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch payers',
        details: error.response?.data || null
      },
      { status: error.response?.status || 500 }
    );
  }
}
