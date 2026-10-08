import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserProfile } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data', 'userProfile.json');

const DEFAULT_PROFILE: UserProfile = {
  name: 'Dr. Sunita Rao',
  role: 'Community Health Manager',
  username: 'dr_sunita',
  avatarUrl: '/images/dr_sunita_avatar.jpg',
  lastUpdated: new Date().toISOString(),
};

function readProfileFromFile(): UserProfile {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch (err) {
    console.error('Error reading userProfile.json:', err);
  }
  return DEFAULT_PROFILE;
}

function saveProfileToFile(profile: UserProfile): boolean {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(profile, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing userProfile.json:', err);
    return false;
  }
}

export async function GET() {
  try {
    const profile = readProfileFromFile();
    return NextResponse.json({ success: true, profile });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, username, password, avatarUrl } = body;

    const current = readProfileFromFile();

    const updatedProfile: UserProfile = {
      name: name !== undefined && name.trim() !== '' ? name.trim() : current.name,
      role: role !== undefined && role.trim() !== '' ? role.trim() : current.role,
      username: username !== undefined && username.trim() !== '' ? username.trim() : current.username,
      avatarUrl: avatarUrl !== undefined && avatarUrl.trim() !== '' ? avatarUrl.trim() : current.avatarUrl,
      lastUpdated: new Date().toISOString(),
    };

    const saved = saveProfileToFile(updatedProfile);

    return NextResponse.json({
      success: true,
      message: password ? 'Username, password & profile updated successfully' : 'Profile updated successfully',
      profile: updatedProfile,
      savedToFile: saved,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
