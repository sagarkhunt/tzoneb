# Fix: Cannot find module 'bcrypt'

## The Problem

TypeScript cannot find `bcrypt` because `npm install` failed due to Windows EPERM (permission) errors. This happens when:
- Antivirus software locks files in node_modules
- File explorer or other programs have files open
- Previous npm processes didn't clean up properly

## Solutions (Try in Order)

### Solution 1: Clean Installation ⭐ RECOMMENDED

```powershell
# 1. Close ALL programs that might access the folder:
#    - Close VS Code/Cursor
#    - Close File Explorer
#    - Close any terminals

# 2. Reopen terminal as Administrator and run:
cd "D:\New folder\demo"
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm cache clean --force
npm install
```

### Solution 2: Install with Force

```powershell
npm install --force --no-optional
```

### Solution 3: Use Yarn Instead

```powershell
# Install Yarn globally if needed
npm install -g yarn

# Then use Yarn
yarn install
```

### Solution 4: Docker Development (No npm needed!) 🐳

```powershell
# Start services with Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Dependencies are installed inside the container
# No need for local node_modules
```

### Solution 5: Manual bcrypt Installation

If only bcrypt is missing after partial install:

```powershell
npm install bcrypt @types/bcrypt --force
```

## Verify Installation

After successful installation:

```powershell
# Check if bcrypt exists
Test-Path node_modules\bcrypt

# Should return: True
```

## Next Steps After Fix

```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Run migrations
npm run prisma:migrate

# 3. Seed database
npm run prisma:seed

# 4. Start app
npm run start:dev
```

## Why This Happens

Windows file locking is stricter than Unix systems. Common causes:
- **Antivirus**: Real-time scanning locks files
- **IDEs**: File watchers keep files open
- **Build tools**: Webpack/TSC may have file handles
- **Windows Search**: Indexing service

## Prevention

1. Disable real-time scanning for project folder
2. Close IDE before npm install
3. Use `--legacy-peer-deps` flag if needed
4. Consider using WSL2 for better Linux compatibility
