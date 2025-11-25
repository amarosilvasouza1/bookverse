import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, bio, image, banner, socialLinks } = body;
    
    console.log('Profile update request:', {
      hasName: !!name,
      hasBio: !!bio,
      imageSize: image ? image.length : 0,
      bannerSize: banner ? banner.length : 0,
    });

    const user = await prisma.user.update({
      where: { id: session.id as string },
      data: {
        name,
        bio,
        image,
        banner,
        socialLinks: typeof socialLinks === 'object' ? JSON.stringify(socialLinks) : socialLinks,
        geminiApiKey: body.geminiApiKey,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
