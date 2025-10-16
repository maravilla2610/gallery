'use server'

import prisma from '@/prisma/client'
import {
  type ArtPiece,
  type CreateArtPieceInput,
  createArtPieceSchema
} from '@/lib/schemas/art-piece.schema'
import QRCode from 'qrcode'

export async function getArtPiecesByArtist(artistId: string): Promise<ArtPiece[]> {
  try {
    const artPieces = await prisma.art_piece.findMany({
      where: {
        artist_id: artistId,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Parse and serialize each art piece for client-safe transmission
    return artPieces.map((piece: typeof artPieces[0]): ArtPiece => ({
      id: piece.id,
      created_at: piece.created_at.toISOString(),
      name: piece.name,
      description: piece.description,
      price: piece.price ? parseFloat(piece.price.toString()) : null,
      qr_code: piece.qr_code || null,
      artist_id: piece.artist_id,
      image: piece.image || undefined,
      year: piece.year ? Number(piece.year) : undefined,
      type: piece.type || ''
    }))
  } catch (error) {
    console.error('Error fetching art pieces:', error)
    throw new Error('Failed to fetch art pieces')
  }
}

export async function createArtPiece(input: CreateArtPieceInput): Promise<ArtPiece> {
  try {

    // Create the art piece
    const artPiece = await prisma.art_piece.create({
      data: {
        name: input.name,
        description: input.description || null,
        price: input.price || null,
        qr_code: null,
        artist_id: input.artist_id,
        image: input.image || null,
        year: input.year || null,
        type: input.type || null,
      },
    })

    // Generate the qr code and update the art piece
    artPiece.qr_code = await generateQRCode(artPiece.id)
    await prisma.art_piece.update({
      where: { id: artPiece.id },
      data: { qr_code: artPiece.qr_code },
    })


    // Serialize for client-safe return
    return {
      id: artPiece.id,
      created_at: artPiece.created_at.toISOString(),
      name: artPiece.name,
      description: artPiece.description,
      price: artPiece.price ? parseFloat(artPiece.price.toString()) : null,
      qr_code: artPiece.qr_code || null,
      artist_id: artPiece.artist_id,
      image: artPiece.image || undefined,
      year: artPiece.year ? Number(artPiece.year) : undefined,
      type: artPiece.type || ''
    } as ArtPiece
  } catch (error) {
    console.error('Error creating art piece:', error)
    throw error instanceof Error ? error : new Error('Failed to create art piece')
  }
}

export async function deleteArtPiece(artPieceId: string): Promise<void> {
  try {
    await prisma.art_piece.delete({
      where: {
        id: artPieceId,
      },
    })
  } catch (error) {
    console.error('Error deleting art piece:', error)
    throw new Error('Failed to delete art piece')
  }
}

export async function generateArtPieceDocument(artPieceId: string): Promise<string> {
  try {
    const artPiece = await prisma.art_piece.findUnique({
      where: { id: artPieceId },
      include: {
        artist: true,
      },
    })
    console.log("art piece:", artPiece)

    if (!artPiece) {
      throw new Error('Art piece not found')
    }

    // Create a museum-style placard/label with embedded QR code
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${artPiece.name} - Museum Label</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page {
      size: A5 landscape;
      margin: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    
    .museum-label {
      background: white;
      width: 210mm;
      height: 148mm;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid #e0e0e0;
    }
    
    .label-header {
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    
    .artwork-title {
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    
    .artist-name {
      font-size: 20px;
      color: #555;
      font-style: italic;
      margin-bottom: 12px;
    }
    
    .metadata {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #666;
      flex-wrap: wrap;
    }
    
    .metadata-item {
      display: flex;
      gap: 6px;
    }
    
    .metadata-label {
      font-weight: 600;
      color: #333;
    }
    
    .label-body {
      flex: 1;
      display: flex;
      gap: 30px;
    }
    
    .description-section {
      flex: 1;
    }
    
    .description-text {
      font-size: 15px;
      line-height: 1.6;
      color: #333;
      text-align: justify;
    }
    
    .price-info {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
    }
    
    .price-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .price-value {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 180px;
      padding: 20px;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    
    .qr-code {
      width: 140px;
      height: 140px;
      margin-bottom: 12px;
      border: 2px solid #1a1a1a;
      border-radius: 4px;
    }
    
    .qr-instruction {
      font-size: 11px;
      color: #666;
      text-align: center;
      line-height: 1.4;
      max-width: 160px;
    }
    
    .label-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      font-size: 11px;
      color: #999;
    }
    
    .gallery-info {
      font-weight: 500;
    }
    
    .certificate-id {
      font-family: 'Courier New', monospace;
      color: #666;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .museum-label {
        box-shadow: none;
        border: none;
        width: 100%;
        height: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="museum-label">
    <div class="label-header">
      <div class="artwork-title">${artPiece.name}</div>
      <div class="artist-name">${artPiece.artist.name || 'Unknown Artist'}</div>
      <div class="metadata">
        ${artPiece.year ? `
        <div class="metadata-item">
          <span class="metadata-label">Year:</span>
          <span>${artPiece.year}</span>
        </div>
        ` : ''}
        ${artPiece.type ? `
        <div class="metadata-item">
          <span class="metadata-label">Medium:</span>
          <span>${artPiece.type}</span>
        </div>
        ` : ''}
      </div>
    </div>
    
    <div class="label-body">
      <div class="description-section">
        ${artPiece.description ? `
        <div class="description-text">
          ${artPiece.description}
        </div>
        ` : '<div class="description-text" style="color: #999; font-style: italic;">No description available.</div>'}
        
        ${artPiece.price ? `
        <div class="price-info">
          <div class="price-label">Price</div>
          <div class="price-value">$${parseFloat(artPiece.price.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        ` : ''}
      </div>
      
      ${artPiece.qr_code ? `
      <div class="qr-section">
        <img src="${artPiece.qr_code}" alt="QR Code" class="qr-code" />
        <div class="qr-instruction">
          Scan to view online and purchase
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="label-footer">
      <div class="gallery-info">Gallery Collection</div>
      <div class="certificate-id">ID: ${artPiece.id.substring(0, 8).toUpperCase()}</div>
    </div>
  </div>
</body>
</html>
    `

    return html
  } catch (error) {
    console.error('Error generating art piece document:', error)
    throw new Error('Failed to generate art piece document')
  }
}

/**
 * Helper function that creates a QR code with the link to the checkout page of the art piece
 * @param artPieceId - The ID of the art piece
 * @returns A base64-encoded data URL of the QR code image
 */
export async function generateQRCode(artPieceId: string): Promise<string> {
  try {
    const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?artPieceId=${artPieceId}`

    // Generate QR code as data URL (base64)
    const qrCodeDataUrl = await QRCode.toDataURL(checkoutUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 300,
    })

    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}
