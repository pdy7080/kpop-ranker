# Chargeap Server SSH Access Skill

## Purpose
Provide reliable, consistent SSH access to the Chargeap production server (d11475.sgp1.stableserver.net) for all development and deployment tasks.

## Server Information
- **Server Name**: chargeapp.net
- **Hostname**: d11475.sgp1.stableserver.net
- **Server IP**: 103.138.189.39
- **User**: chargeap
- **SSH Key**: ~/.ssh/id_ed25519
- **Home Directory**: /home/chargeap

## Project Locations

### Auto-Bid Project (현재 작업 중)
- **Main Path**: ~/apps/autobid/
- **Current Release**: ~/apps/autobid/current (symlink)
- **Shared Data**: ~/apps/autobid/shared/data
- **Git Repo**: ~/apps/autobid/repo.git
- **Domain**: https://autobid.chargeapp.net

### Other Projects on Same Server
- `~/kpop.chargeapp.net/` - K-pop Ranker project
- `~/kbridge.chargeapp.net/` - KBridge project
- `~/sungsuya.com/` - Sungsuya project
- `~/bymint.be/` - Bymint project
- `~/public_html/` - Main website

**⚠️ Important**: Always specify the full project path when working with multiple projects!

## Reliable SSH Connection Methods

### Method 1: Standard SSH with Optimized Flags (RECOMMENDED)
```bash
ssh -i ~/.ssh/id_ed25519 \
    -o ConnectTimeout=10 \
    -o ServerAliveInterval=60 \
    -o ServerAliveCountMax=3 \
    -o StrictHostKeyChecking=no \
    chargeap@d11475.sgp1.stableserver.net \
    "YOUR_COMMAND_HERE"
```

**When to use**: Single commands, quick checks, most operations

**Advantages**:
- Most reliable across all platforms (Windows/Linux/Mac)
- Works with Git Bash, WSL, native SSH
- No persistent connection needed
- Average connection time: ~2.7s

### Method 2: Batch Mode (No Interactive Prompts)
```bash
ssh -i ~/.ssh/id_ed25519 \
    -o BatchMode=yes \
    -o ConnectTimeout=10 \
    -o StrictHostKeyChecking=no \
    chargeap@d11475.sgp1.stableserver.net \
    "YOUR_COMMAND_HERE"
```

**When to use**: Automated scripts, CI/CD pipelines, cron jobs

**Advantages**:
- Never prompts for passwords
- Fails fast if key authentication doesn't work
- Perfect for automation

### Method 3: Compressed Transfer (For Large File Operations)
```bash
ssh -i ~/.ssh/id_ed25519 \
    -C \
    -o ConnectTimeout=10 \
    -o StrictHostKeyChecking=no \
    chargeap@d11475.sgp1.stableserver.net \
    "YOUR_COMMAND_HERE"
```

**When to use**: Transferring logs, reading large files, database dumps

**Advantages**:
- Faster for text-heavy operations
- Reduces bandwidth usage

## Working with Multiple Projects

### List All Projects
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "
echo '=== All Projects ===' && \
ls -lh ~/apps/ && \
echo '' && \
echo '=== Domain-based Projects ===' && \
ls -lh ~ | grep chargeapp.net
"
```

### Switch Between Projects
```bash
# Auto-Bid project
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "cd ~/apps/autobid/current && pwd && ls"

# K-pop project
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "cd ~/kpop.chargeapp.net && pwd && ls"

# KBridge project
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "cd ~/kbridge.chargeapp.net && pwd && ls"
```

### Check PM2 for All Projects
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "pm2 list"
```

## Common Tasks

### 0. Navigate to Project Root (Important!)
```bash
# Auto-Bid
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "cd ~/apps/autobid/current && YOUR_COMMAND"

# Other projects - use full path
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "cd ~/PROJECT_PATH && YOUR_COMMAND"
```

### 1. Check Server Status
```bash
ssh -i ~/.ssh/id_ed25519 -o ConnectTimeout=10 chargeap@d11475.sgp1.stableserver.net "\
    echo '=== System Info ===' && \
    hostname && \
    uptime && \
    df -h | head -3 && \
    echo '' && \
    echo '=== PM2 Status ===' && \
    pm2 status
"
```

### 2. View Dashboard Logs
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "\
    pm2 logs autobid-dashboard --lines 50 --nostream
"
```

### 3. Restart Service
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "\
    pm2 restart autobid-dashboard && \
    pm2 status autobid-dashboard
"
```

### 4. Check File Existence
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "\
    ls -la ~/apps/autobid/current/admin_dashboard/templates/ | grep wishket
"
```

### 5. Read Remote File
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "\
    cat ~/apps/autobid/current/admin_dashboard/main.py | grep -A 5 'wishket'
"
```

### 6. Upload File via SCP
```bash
scp -i ~/.ssh/id_ed25519 \
    -o StrictHostKeyChecking=no \
    LOCAL_FILE \
    chargeap@d11475.sgp1.stableserver.net:~/apps/autobid/current/PATH/TO/FILE
```

### 7. Download File via SCP
```bash
scp -i ~/.ssh/id_ed25519 \
    -o StrictHostKeyChecking=no \
    chargeap@d11475.sgp1.stableserver.net:~/apps/autobid/current/PATH/TO/FILE \
    LOCAL_DESTINATION
```

### 8. Execute Multiple Commands Sequentially
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "bash -s" << 'EOF'
set -e  # Exit on error
cd ~/apps/autobid/current
echo "Current directory: $(pwd)"
git status
pm2 list | grep autobid
echo "All checks complete"
EOF
```

## File Transfer Best Practices

### Upload Single File
```bash
scp -i ~/.ssh/id_ed25519 \
    admin_dashboard/main.py \
    chargeap@d11475.sgp1.stableserver.net:~/apps/autobid/current/admin_dashboard/main.py
```

### Upload Multiple Files
```bash
scp -i ~/.ssh/id_ed25519 \
    admin_dashboard/templates/*.html \
    chargeap@d11475.sgp1.stableserver.net:~/apps/autobid/current/admin_dashboard/templates/
```

### Upload Directory Recursively
```bash
scp -i ~/.ssh/id_ed25519 -r \
    admin_dashboard/static/ \
    chargeap@d11475.sgp1.stableserver.net:~/apps/autobid/current/admin_dashboard/
```

## Troubleshooting

### Issue 1: "Permission denied (publickey)"
**Solution**:
```bash
# Verify key exists
ls -la ~/.ssh/id_ed25519

# Check key permissions (should be 600)
chmod 600 ~/.ssh/id_ed25519

# Test key authentication
ssh -i ~/.ssh/id_ed25519 -v chargeap@d11475.sgp1.stableserver.net "echo 'Key works'"
```

### Issue 2: "Connection timeout"
**Solution**:
```bash
# Use longer timeout
ssh -i ~/.ssh/id_ed25519 -o ConnectTimeout=30 chargeap@d11475.sgp1.stableserver.net "echo 'test'"

# Check network connectivity
ping d11475.sgp1.stableserver.net -c 3
```

### Issue 3: "Host key verification failed"
**Solution**:
```bash
# Remove old host key
ssh-keygen -R d11475.sgp1.stableserver.net

# Or use StrictHostKeyChecking=no (already in our commands)
```

### Issue 4: Command works sometimes, fails other times
**Solution**: Use BatchMode to prevent interactive prompts
```bash
ssh -i ~/.ssh/id_ed25519 -o BatchMode=yes -o ConnectTimeout=10 chargeap@d11475.sgp1.stableserver.net "YOUR_COMMAND"
```

## PM2 Commands Reference

### List all processes
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "pm2 list"
```

### View logs
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "pm2 logs SERVICE_NAME --lines 50 --nostream"
```

### Restart service
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "pm2 restart SERVICE_NAME"
```

### Stop service
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "pm2 stop SERVICE_NAME"
```

### Start service
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "pm2 start SERVICE_NAME"
```

### Monitor in real-time
```bash
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "pm2 monit"
```

## Important Notes

1. **Always quote your remote commands** to prevent local shell expansion
2. **Use double quotes** for commands with variables: `"echo $HOME"`
3. **Use single quotes** for literal strings: `'grep "error" file.log'`
4. **Chain commands with &&** for sequential execution: `"cmd1 && cmd2 && cmd3"`
5. **Use heredoc for complex scripts** (see example #8 above)
6. **Avoid interactive commands** (like vim, nano) - use cat/grep instead
7. **Test with echo first** before running destructive commands

## Performance Tips

1. **Combine multiple checks** into one SSH call instead of multiple calls
2. **Use grep/head/tail** to filter output server-side before transfer
3. **Compress large transfers** with `-C` flag
4. **Reuse connections** when running many commands (though limited on Windows)

## Security Notes

1. ✅ **NEVER share the private key** (~/.ssh/id_ed25519)
2. ✅ **Use BatchMode** for automated scripts to prevent password leaks
3. ✅ **ConnectTimeout** prevents hanging on network issues
4. ✅ **ServerAliveInterval** keeps connection alive for long operations
5. ⚠️ **StrictHostKeyChecking=no** is OK for known servers but disables MITM protection

## Quick Reference Card

```bash
# Basic pattern
ssh -i ~/.ssh/id_ed25519 -o ConnectTimeout=10 chargeap@d11475.sgp1.stableserver.net "COMMAND"

# File upload
scp -i ~/.ssh/id_ed25519 LOCAL_FILE chargeap@d11475.sgp1.stableserver.net:REMOTE_PATH

# File download
scp -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net:REMOTE_PATH LOCAL_FILE

# PM2 logs
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "pm2 logs SERVICE --lines 50 --nostream"

# PM2 restart
ssh -i ~/.ssh/id_ed25519 chargeap@d11475.sgp1.stableserver.net "pm2 restart SERVICE"
```

---

## Test Results

All connection methods tested on **2025-11-16 19:11 KST**:

| Test | Method | Result | Notes |
|------|--------|--------|-------|
| ✅ Basic SSH | `-i ~/.ssh/id_ed25519 -o ConnectTimeout=10` | SUCCESS | Avg 2.7s connection time |
| ✅ BatchMode | `-o BatchMode=yes` | SUCCESS | No interactive prompts |
| ✅ Compression | `-C` | SUCCESS | Good for large transfers |
| ✅ Multi-command | `cmd1 && cmd2 && cmd3` | SUCCESS | Sequential execution works |
| ✅ Heredoc script | `bash -s << 'EOF'` | SUCCESS | Complex scripts supported |
| ✅ File operations | create/read/delete | SUCCESS | All operations work |
| ✅ PM2 commands | list/logs/restart | SUCCESS | Service management works |
| ✅ Data access | `~/apps/autobid/shared/data` | SUCCESS | All directories accessible |
| ✅ SCP upload | `scp file server:/path` | SUCCESS | File transfer works |
| ✅ SCP download | `scp server:/path file` | SUCCESS | Download works |
| ❌ ControlMaster | Persistent connection | FAILED | Not supported on Windows |

**Recommendation**: Use Method 1 (Basic SSH with optimized flags) for all operations.

---

**Created**: 2025-11-16
**Last Updated**: 2025-11-16
**Version**: 1.0
**Tested Platforms**: Windows 11, Git Bash, WSL
**Test Status**: ✅ All core operations validated
